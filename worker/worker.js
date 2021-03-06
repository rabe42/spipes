/* global setImmediate */
const logger = require("../common/logger")
const PouchDB = require("pouchdb")
const Promise = require("promise")
const fs = require("fs")
const path = require("path")

class Worker {
    constructor(config) {
        if (!config) {
            throw new Error("No configuration provided!")
        }
        this.config = config
    }

    /**
     * Calculates the database location, depending on the fact, if the database is local or remote.
     * @param {string} databaseUrl A local or a remote database location.
     * @param {string} topic The topic of the database
     * @returns {string} The complete database location URL.
     */
    calculateMessageDatabaseLocation(databaseUrl, topic) {
        if (this.isRemoteDatabase(databaseUrl)) {
            return `${databaseUrl}/messages/${topic}`
        }
        else {
            this.checkLocationExists(databaseUrl)
            this.checkLocationExists(path.format({dir: databaseUrl + "/messages"}))
            return path.format({dir: databaseUrl + "/messages", base: topic})
        }
    }

    /**
     * Creates a new database for the consecutive use.
     * @param {string} databaseUrl The URL of the 
     * @param {string} topic The topic for which the database should created.
     */
    init(databaseUrl, topic) {
        logger.debug(`${this.constructor.name}.init(): ${databaseUrl} / ${topic}.`)
        let databaseLocation = this.calculateMessageDatabaseLocation(databaseUrl, topic)
        logger.debug(`${this.constructor.name}.init(): Create database at "${databaseLocation}".`)
        this.db = new PouchDB(databaseLocation)
    }

    /**
     * Checks, if the provided URL is remote.
     * @param {string} databaseUrl The URL or directory of the database.
     */
    isRemoteDatabase(databaseUrl) {
        return databaseUrl.startsWith("http://") 
            || databaseUrl.startsWith("https://")
    }

    /**
     * Checks, if the folder of the database exists.
     * @param {string} databaseUrl A local directory to check.
     */
    checkLocationExists(databaseUrl) {
        if (!fs.existsSync(databaseUrl)) {
            logger.error(`Worker.init(): Database location "${databaseUrl}" isn't valid!`)
            throw new Error(`Database location "${databaseUrl}" isn't valid!`)
        }
    }

    /**
     * @param {string} originator The originator of a message.
     * @param {number} A sequence number.
     * @returns {string} The message Id, calculated from the available information.
     */
    calculateMessageId(originator, sequenceNo) {
        if (isNaN(sequenceNo)) {
            throw new Error(`Exporter.calcuateMessageId(): The provided seqenceNo="${sequenceNo}" is not a number!`)
        }
        return `${this.config.topic}-${originator}-${sequenceNo}`
    }

    /**
     * Closes all resources and frees them for further use.
     * @returns The promise of the close.
     */
    close() {
        if (this.db) {
            logger.info(`${this.constructor.name}.close(): Closing the database for topic: ${this.config.topic}`)
            return this.db.close()
        }
        return new Promise((resolve) => {
            logger.debug(`${this.constructor.name}.close(): No database present.`)
            setImmediate(resolve())
        })
    }

    /**
     * Start to accept the connections from the clients.
     */
    start() {
        logger.error(`Worker.start(): Calling method which should be overwritten! class=${typeof this}`)
        throw new Error("Worker.start(): Not implemented yet!")
    }
}

module.exports = Worker