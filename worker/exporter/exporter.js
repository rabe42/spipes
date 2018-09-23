/* global setImmediate */
const Worker = require("../worker")
const validateConfiguration = require("./validate-configuration")
const fs = require("fs")
const path = require("path")
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
class Exporter extends Worker {

    constructor(config) {
        super(config)
        if (!config) {
            throw new Error("No config provided!")
        }
        validateConfiguration(config)
        this.config = config
    }

    /**
     * Starts the exporter. This checks the configured number of millis the queue and
     * will export a message, if this is part of the deal.
     */
    start() {
        const that = this
        this.init(`${this.config["database-url"]}/${this.config.topic}`)

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
        db.allDocs({include_docs: true})
            .then((result) => {
                for (let i = 0; i < result.rows.length; i++) {
                    this.exportMessage(result.rows[i].doc)
                }
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
        const fn = path.format({dir: this.config["export-dir"], base: message._id})
        fs.writeFileSync(fn, JSON.stringify(message))
    }
}

module.exports = Exporter