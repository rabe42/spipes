/* global setImmediate */
const Worker = require("../worker")
const validateConfiguration = require("./validate-configuration")
const fs = require("fs")
const path = require("path")
const logger = require("../../common/logger")
const Promise = require("promise")
const PouchDB = require("pouchdb")

/**
 * An exporter will export the messages stored in the database,
 * if the destination matches the configured name of this exporter. 
 * It will make sure, that the sequence of the export is exactly monotone
 * growing. 
 * Given this, only one message will be exported after the other.
 * 
 * @author Dr. Ralf Berger (c) 2018
 */
class Exporter extends Worker {

    constructor(config) {
        super(config)
        validateConfiguration(config)
    }

    initExportedStore(databaseUrl, exportedStore) {
        this.exportedDb = new PouchDB(`${databaseUrl}/${exportedStore}`)
    }

    /**
     * Starts the exporter. This checks the configured number of millis the queue and
     * will export a message, if this is part of the deal.
     */
    start() {
        const that = this
        this.init(this.config["database-url"], this.config["topic"])
        this.initExportedStore(this.config["database-url"], this.config["exported-store"])

        // Create the export directory, if it didn't exists already.
        if (!fs.existsSync(this.config["export-dir"])) {
            fs.mkdirSync(this.config["export-dir"])
        }

        logger.debug(`Exporter.start(): export-dir="${this.config["export-dir"]}"`)

        // schedule the first look into the database
        setImmediate(() => {
            that.processMessages(that.db)
        })
        // schedule the consecutive looks into the database.
        setInterval(() => {
            that.processMessages(that.db)
        }, this.config.interval)
    }

    /**
     * Process the messages from the database in the sequence of their Ids.
     * @param {PouchDB} db The database which will provide the messages.
     */
    processMessages(db) {
        logger.debug("Exporter.processMessages()")
        const that = this
        db.allDocs({include_docs: true})
            .then((result) => {
                for (let i = 0; i < result.rows.length; i++) {
                    let message = result.rows[i].doc
                    message.toString = () => { return `{_id=${message._id}, _rev=${message._rev}}`}
                    let messageClone = Object.assign({}, message)
                    delete messageClone._rev
                    that.exportMessage(message).then(() => {
                        // You have to store the clone, which do not have the _rev attribute!
                        return that.saveToExportedStore(messageClone)
                    }).then(() => {
                        return that.removeMessageFromTopic(message)
                    }).catch((error) => {
                        logger.error(`Exporter.processMessage(): Error "${error}" during storing message=${message}`)
                    })
                }
            })
            .catch((error) => {
                logger.error(`Exporter.processMessage(): Error "${error}" while processing messages.`)
                // Move the message to an error store
            })
    }

    /**
     * Makes sure, that the current file is writen in an synchronous way. This means only after
     * the file is written to the file system, the function will return.
     * @param {any} message The message stored in the database.
     */
    exportMessage(message) {
        logger.debug(`Exporter.exportMessage(): ${message}`)
        const fn = path.format({dir: this.config["export-dir"], base: message._id})
        return new Promise((resolve, reject) => {
            fs.writeFile(fn, JSON.stringify(message), (error, result) => {
                if (error) {
                    reject(error)
                }
                else {
                    resolve(result)
                }
            })
        })
    }

    /**
     * Save the provided message into the configured exported store.
     * @param {*} message The message to store.
     * @return A promise, which will be fulfilled, as soon as the message is saved.
     */
    saveToExportedStore(message) {
        logger.debug(`Exporter.saveToExportedStore(): message=${message}`)
        return this.exportedDb.put(message)
    }

    /**
     * Deletes the message from the topic store.
     * @param {*} message The message to delete from the data store.
     * @return A promise, which will be fulfilled, as soon as the message is deleted.
     */
    removeMessageFromTopic(message) {
        logger.debug(`Exporter.removeMessageFromTopic(): message=${message}`)
        return this.db.remove(message)
    }
}

module.exports = Exporter