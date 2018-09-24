const logger = require("../common/logger")
const PouchDB = require("pouchdb")
const Promise = require("promise")

class Worker {
    constructor(config) {
        if (!config) {
            throw new Error("No configuration provided!")
        }
        this.config = config
    }

    /**
     * Creates a new database for the consecutive use.
     * @param {string} databaseLocation The location of the database.
     */
    init(databaseLocation) {
        logger.debug(`${this.constructor.name}.init(): Create database at "${databaseLocation}".`)
        this.db = new PouchDB(databaseLocation)
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
            resolve()
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