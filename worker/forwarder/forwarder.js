const Worker = require("../worker")
const logger = require("../../common/logger")
const validateConfiguration = require("./validate-configuration")

/**
 * This is the forwarder worker. It tries to forward the content of the
 * configured topic to the configured receivers.
 * For each completed tranmission a new datarecord is created.
 */
class Forwarder extends Worker {

    constructor(config) {
        super(config)
        validateConfiguration(config)
        this.init(`${this.config["database-url"]}/${this.config.topic}`)
        this.createH2Clients()
    }

    /**
     * Creates the http/2 clients, which will be used to communicate
     * the changes.
     */
    createH2Clients() {

    }

    start() {
        logger.debug("Forwarder.start()")

        // Start the processing.
    }
}

module.exports = Forwarder