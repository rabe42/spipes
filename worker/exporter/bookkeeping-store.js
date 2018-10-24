const PouchDB = require("pouchdb")
const Promise = require("promise")
const logger = require("../../common/logger")

/**
 * Management of the bookkeeping store and the entry.
 * 
 * @author Dr. Ralf Berger (c) 2018
 */
class BookkeepingStore {

    constructor(config) {
        if (!config) {
            throw new Error("One of the parameters to create a bookstore isn't present!")
        }
        this.topic = config.topic
        this.bookkeepingDb = new PouchDB(`${config["database-url"]}/${config.topic}${config.id}`)
        this.originators = config.originators
    }

    /**
     * Calculates the id of the bookkeeping record of an particular originator.
     * @param {string} originator The originator of a message.
     * @returns {string} The identifier of the bookkeeping record.
     */
    calculateBookkeepingId(originator) {
        return `${this.topic}-${originator}`
    }

    /**
     * @returns {string[]} An array of bookkeeping identifiers.
     */
    calculateBookkeepingIds() {
        let result = []
        if (this.originators) {
            for (let i = 0; i < this.originators.length; i++) {
                result.push(this.calculateBookkeepingId(this.originators[i]))
            }
        }
        return result
    }

    /**
     * @returns {Promise} A promise, which is resolved, if the bookkeeping can be initialized for all originators.
     */
    initiateBookkeeping() {
        logger.debug("Exporter.initiateBookkeeping()")
        const bookKeepingIds = this.calculateBookkeepingIds()
        const promises = []
        for (let i = 0; i < bookKeepingIds.length; i++) {
            promises.push(this.getBookkeepingInfo(bookKeepingIds[i], this.originators[i]))
        }
        logger.debug(`Exporter.initiateBookkeeping(): Number of records: ${promises.length}`)
        return Promise.all(promises)
    }

    /**
     * Tries to create a new bookkeeping document. If this is not working, it try to retrieve the existing.
     * @param {PouchDB} bookDB An instance of the database, which stores the bookkeeping information.
     * @param {string} bookkeepingId An id for the bookkeeping information.
     * @param {string} originator The source of a message. This information comes with every message.
     * @returns {Promise} A promise which resoves with the result from the database. 
     */
    getBookkeepingInfo(bookkeepingId, originator) {
        logger.debug(`Exporter.getBookeepingInfo(): for="${bookkeepingId}" from="${originator}"`)
        const that = this
        return new Promise((resolve, reject) => {
            // Try to store the starting book keeping information.
            that.bookkeepingDb.put({"_id": bookkeepingId, "sequence-no": 0}).then(() => {
                logger.info(`Exporter.getBookkeepingInfo(): Created bookkeeping information for "${bookkeepingId}"`)
                that.bookkeepingDb.get(bookkeepingId).then((doc) => {
                    logger.debug(`Exporter.getBookkeepingInfo(): Retrieved new bookkeeping information from database: ${doc}`)
                    resolve(doc)
                }).catch((error) => {
                    logger.error(`Exporter.getBookkeepingInfo(): Unexpected error in getting new created info: ${error} for bookkeepingId "${bookkeepingId}"`)
                    reject(error)
                })
            }).catch(() => {
                // If the information cannot be written, try to read it.
                logger.info(`Exporter.getBookkeepingInfo(): Cannot create bookkeeping information for: "${bookkeepingId}" trying to get it.`)
                that.bookkeepingDb.get(bookkeepingId).then((doc) => {
                    logger.info(`Exporter.getBookkeepingInfo(): got bookkeeping info for "${bookkeepingId}"!`)
                    resolve(doc)
                }).catch((error) => {
                    logger.error(`Exporter.getBookkeepingInfo(): Cannot retrieve or create bookkeeping informations for: "${bookkeepingId}" due to: "${error}"`)
                    reject(error)
                })
            })
        })
    }

    /**
     * Updates the bookkeeping record of a particular originator.
     * @param {string} originator The originator of the message.
     * @param {number} sequenceNo The sequence number to be written to the record.
     * @returns {Promise} A promise, which will be resolved on success.
     */
    updateBookkeepingInfo(originator, sequenceNo) {
        logger.debug(`Exporter.updateBookkeepingInfo() originator=${originator} seq-no=${sequenceNo}`)
        return new Promise((resolve, reject) => {
            this.bookkeepingDb.get(`${this.topic}-${originator}`).then((doc) => {
                doc["sequence-no"] = sequenceNo
                logger.debug(`Exporter.updateBookkeepingInfo() updating to sequenceNo=${sequenceNo}`)
                resolve(this.bookkeepingDb.put(doc))
            }).catch((error) => {
                logger.error(`Exporter.updateBookkeepingInfo(): Cannot update bookkeeping information for: ${originator} due to: ${error}`)
                reject(error)
            })
        })
    }
}

module.exports = BookkeepingStore