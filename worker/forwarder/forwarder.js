const Worker = require("../worker")
const logger = require("../../common/logger")
const validateConfiguration = require("./validate-configuration")
const http2 = require("http2")
const Promise = require("promise")
const PouchDB = require("pouchdb")

/**
 * This is the forwarder worker. It tries to forward the content of the
 * configured topic to the configured receiver. The transmitted message is archieved in the
 * forwarded database.
 */
class Forwarder extends Worker {

    constructor(config) {
        super(config)
        validateConfiguration(config)
        this.init(this.config["database-url"], this.config.topic)
        this._createForwardedDb()
        this._createH2ClientSession()
    }

    /**
     * Triggers the processing of the database content.
     */
    async start() {
        logger.debug("Forwarder.start()")
        const that = this
        // Read the configured "limit" messages for the configured topic from the database.
        try {
            let docs = await this.db.allDocs({"limit": this.config.limit})
            for (let i = 1; i < docs.rows.length; i++) {
                that._processMessage(docs.rows[i]._id)
            }
        } catch(error) {
            logger.error(`Cannot read from the topic store due to ${error}`)
        }
        // Spawn the next run after the configured interval.
        setTimeout(() => {
            that.start()
        }, that.config.interval)
    }

    /**
     * Create the database, which will manage all forwared data. This database
     * must be cleaned after a retention period. This is the responsibility of another worker.
     */
    _createForwardedDb() {
        this.forwardedDb = new PouchDB(this.config["forwarded-url"])
    }

    /**
     * Creates the http/2 client session, which will be used to communicate
     * the messages to a receiver.
     */
    _createH2ClientSession() {
        const hostDefinition = this.config.host
        let that = this
        this.h2session = http2.connect(
            `https://${hostDefinition.host}:${hostDefinition.port}`,
            {ca: hostDefinition.certificate})
        this.h2session.on("error", (err) => {
            logger.error(`Forwarder.createH2ClientSession(${this.config.topic}): error - Exiting h2 client with error: ${err}`)
            that.h2session.close()
        })
        this.h2session.on("close", () => {
            logger.info(`Forwarder.createH2ClientSession(${this.config.topic}): close - exiting h2 client.`)
        })
    }

    /**
     * Reads the real content of the message and send it to an receiver, if successful.
     */
    async _processMessage(messageId) {
        logger.debug("Forwarder._processMessage(): begin")
        //const that = this
        try {
            let message = await this.db.get(messageId)
            await this._forwardMessage(message)
            await this._saveMessage(message)
            await this._removeMessage(message)    
        }
        catch (error) {
            logger.error(`Forwarder._processMessage(): Cannot save message due to "${error}"`)
        }
        /*
        return this.db.get(messageId).then((message) => {
            // Forward them to the receiver.
            return that._forwardMessage(message).then(() => {
                // Store them to the forwarded database.
                return that._saveMessage(message)
            }).then(() => {
                // Remove them from the topic database.
                return that._removeMessage(message)
            }).catch((error) => {
                logger.error(`Forwarder._processMessage(): Wasn't able to process message due to ${error}!`)
            })
        }).catch((error) => {
            logger.error(`Forwarder._processMessage(): Wasn't able to retrieve the message due to ${error}!`)
        })
        */
    }

    /**
     * Send the message to a receiver. It creates a POST request and post the message as a string.
     * @param message The complete message, including the meta information.
     */
    _forwardMessage(message) {
        const that = this
        const body = JSON.stringify(message)
        return new Promise((resolve, reject) => {
            const req = that.h2session.request({ ":path": that.config.topic, ":method": "POST", "content-length": body.length, "content-type": "application/json" })
            req.on("response", (headers /*, flags */) => {
                for (const name in headers) {
                    logger.debug(`Forwarder._forwardMessage(): response.header.${name}: ${headers[name]}`)
                }
            })
            req.setEncoding("utf8")
            let data = ""
            req.on("data", (chunk) => { data += chunk })
            req.on("end", function () {
                logger.debug(`Forwarder._forwardMessage(): received data: ${data}`)
                resolve(data)
            })
            req.on("error", (error) => {
                reject(error)
            })
            req.write(body)
            req.end()
        })
    }

    /**
     * Save the message for investigative purposes.
     * @param message The complete message, including the meta information.
     */
    _saveMessage(message) {
        logger.debug(`Forwarder._saveMessage(): message=${message}.`)
        return this.forwardedDb.put(message)
    }

    /**
     * Remove the message from the topic store.
     * @param message The complete message, including the right _rev information.
     */
    _removeMessage(message) {
        logger.debug(`Forwarder._removeMessage(): message=${message}.`)
        return this.db.remove(message)
    }
}

module.exports = Forwarder