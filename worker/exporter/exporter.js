const Worker = require("../worker")
const validateConfiguration = require("./validate-configuration")
const BookkeepingStore = require("./bookkeeping-store")
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
        this.init(this.config["database-url"], this.config["topic"])
        this.initExportedStore(this.config["database-url"], this.config["exported-store"])
        this.bookkeepingStore = new BookkeepingStore(config)
        this.started = false
    }

    /**
     * Creates the database for the store, where the exported messages should be stored.
     */
    initExportedStore(databaseUrl, exportedStore) {
        this.exportedDb = new PouchDB(`${databaseUrl}/${exportedStore}`)
    }

    /**
     * For each originator setup a separate interfall to process the messages.
     * schedule the consecutive looks into the database.
     */
    startProcessMessages() {
        logger.debug("Exporter.start(): starting processing...")
        const originators = this.config["originators"]
        for (let i = 0; i < originators.length; i++) {
            this.processMessages(originators)
        }
    }

    /**
     * Starts the exporter. This checks the configured number of millis the queue and
     * will export a message, if this is part of the deal.
     */
    start() {
        logger.debug("Exporter.start()")
        const that = this

        // Create the export directory, if it didn't exists already.
        if (!fs.existsSync(this.config["export-dir"])) {
            logger.debug(`Exporter.start(): creating export directory ${this.config["export-dir"]}`)
            fs.mkdirSync(this.config["export-dir"])
        }

        this.bookkeepingStore.initiateBookkeeping()
            .then(() => {
                that.startProcessMessages()
                that.started = true
            })
            .catch((error) => {
                logger.error(`Exporter.start(): Wasn't able to initialize the bookkeeping store due to : "${error}".`)
                that.started = false
            })
    }

    /**
     * Loads the next message, if available and immediately starts the load of the next message. 
     * If no message is available, a the processing of the next message is scheduled after the configured
     * timeinterval.
     * @param {string} originator The database which will provide the messages.
     * @returns {Promise} A promise, which is resolved, if the messages are all read.
     */
    processMessages(originator) {
        logger.debug(`Exporter.processMessages() for originator: ${originator}`)
        const that = this
        return that.bookkeepingStore.getBookkeepingInfo(that.bookkeepingStore.calculateBookkeepingId(originator), originator)
            .then((info) => {
                logger.debug(`Exporter.processMessages(): Got bookkeeping info seq-no:${info["sequence-no"]}`)
                const sequenceNo = info["sequence-no"] + 1
                const messageId = that.calculateMessageId(originator, sequenceNo)
                logger.debug(`Exporter.processMessage() Getting message id="${messageId}"`)
                that.db.get(messageId).then((message) => {
                    message.toString = () => { return `{_id=${message._id}, _rev=${message._rev}}`}
                    logger.debug(`Exporter.processMessage(): Got message ${message}`)
                    let messageClone = Object.assign({}, message)
                    delete messageClone._rev
                    that.exportMessage(message).then(() => {
                        return that.bookkeepingStore.updateBookkeepingInfo(originator, sequenceNo)
                    }).then(() => {
                        // You have to store the clone, which do not have the _rev attribute!
                        return that.saveToExportedStore(messageClone)
                    }).then(() => {
                        return that.removeMessageFromTopic(message)
                    }).then(() => {
                        return that.processMessages(originator)
                    })
                }).catch((error) => {
                    // Message couldn't be retrieved --> Wait for some millis.
                    logger.debug(`Exporter.processMessages(): Wait for new message "${originator}" due to: "${error}"`)
                    return that.waitForNextMessage(originator)
                })
            })
    }

    /**
     * Wait for the next message, until the configured timeout is up.
     * @param {string} originator The originator to process messages from.
     * @returns {Promise} A promise, which resolves with a promise of the processMessages() after the configured interval period.
     */
    waitForNextMessage(originator) {
        const that = this
        logger.debug(`Exporter.waitForNextMessage(): originator=${originator}`)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(that.processMessages(originator))
            }, that.config["interval"])
        })
    }

    /**
     * Makes sure, that the current file is writen in an synchronous way. This means only after
     * the file is written to the file system, the function will return.
     * @param {any} message The message stored in the database.
     * @returns {Promise} A promise, which resolves with the status of the file operation.
     */
    exportMessage(message) {
        logger.debug(`Exporter.exportMessage(): ${message}`)
        const fn = path.format({dir: this.config["export-dir"], base: message._id})
        return new Promise((resolve, reject) => {
            if (!("_id" in message)) {
                logger.error("Exporter.errorMessage(): Cannot export a message without the _id property!")
                reject(new Error("Cannot export a message without the _id property!"))
            }
            fs.writeFile(fn, JSON.stringify(message), (error, result) => {
                if (error) {
                    logger.error(`Exporter.exportMessage(): Cannot export message "${fn}" due to: ${error}.`)
                    reject(error)
                }
                else {
                    logger.debug("Exporter.exportMessage(): Exported message.")
                    resolve(result)
                }
            })
        })
    }

    /**
     * Save the provided message into the configured exported store.
     * @param {*} message The message to store.
     * @return {Promise} A promise, which will be fulfilled, as soon as the message is saved.
     */
    saveToExportedStore(message) {
        logger.debug(`Exporter.saveToExportedStore(): message=${message}`)
        return this.exportedDb.put(message)
    }

    /**
     * Deletes the message from the topic store.
     * @param {*} message The message to delete from the data store.
     * @return {Promise} A promise, which will be fulfilled, as soon as the message is deleted.
     */
    removeMessageFromTopic(message) {
        logger.debug(`Exporter.removeMessageFromTopic(): message=${message}`)
        return this.db.remove(message)
    }
}

module.exports = Exporter