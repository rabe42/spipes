const Worker = require("../worker")
const logger = require("../../common/logger")
const validateConfiguration = require("./validate-configuration")
const http2 = require("http2")

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
        this.createH2ClientSession(config)
    }

    /**
     * Creates the http/2 clients, which will be used to communicate
     * the changes.
     */
    createH2ClientSession(config) {
        this.sessions = {}
        for (let i = 0; i < config.hosts.length; i++) {
            const hostDefinition = this.config.hosts[i]
            const h2session = http2.connect(
                `https://${hostDefinition.host}:${hostDefinition.port}`,
                {ca: hostDefinition.certificate})
            this.sessions[hostDefinition.host] = h2session
            h2session.on("error", (err) => {
                logger.error(`Forwarder.createH2ClientSession(${this.config.topic}): error - Exiting h2 client with error: ${err}`)
            })
            h2session.on("close", () => {
                logger.info(`Forwarder.createH2ClientSession(${this.config.topic}): close - exiting h2 client.`)
            })
        }
    }

    start() {
        logger.debug("Forwarder.start()")

        // Start the processing.
    }
}

module.exports = Forwarder