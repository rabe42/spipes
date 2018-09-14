
const validateConfiguration = require("./validate-configuration")
const fs = require("fs")
const PouchDB = require("pouchdb")
const logger = require("../../common/logger")

/**
 * An exporter will export the messages stored in the database,
 * if the destination matches the configured name of this exporter. 
 * It will make sure, that the sequence of the export is exactly monotone
 * growing. 
 * Given this, only one message will be exported after the other.
 * 
 * @author Dr. Ralf Berger (c) 2018
 */
class Exporter {

    constructor(config) {
        if (!config) {
            throw new Error("No config provided!")
        }
        validateConfiguration(config)
        this.config = config
        if (!this.config.limit) {
            this.config.limit = 1
        }
    }

    /**
     * Starts the exporter. This checks the configured number of millis the queue and
     * will export a message, if this is part of the deal.
     */
    start() {
        const that = this
        let databaseLocation = `${this.config.databaseUrl}/${this.config.topic}`
        logger.debug(`Exporter.start(): databaseLocation="${databaseLocation}"`)
        const db = new PouchDB(databaseLocation)

        // schedule the first look into the database
        setInterval(this.config.interval, (db) => {
            that.processMessages(db)
        }, db)
    }

    /**
     * Process the messages from the database in the sequence of their Ids.
     * @param {PouchDB} db The database which will provide the messages.
     */
    processMessages(db) {
        logger.debug("Exporter.processMessages()")
        db.allDocs()
            .then((result) => {
                this.exportMessage(result)
            })
            .catch((error) => {
                logger.error(error)
                // Move the message to an error folder
            })
    }

    /**
     * Makes sure, that the current file is writen in an synchronous way. This means only after
     * the file is written to the file system, the function will return.
     * @param {any} message The message stored in the database.
     */
    exportMessage(message) {
        logger.debug(`Exporter.exportMessage(): ${message}`)
        fs.writeFileSync(fs.path(this.config["export-dir"], message._id), message)
    }
}

module.exports = Exporter