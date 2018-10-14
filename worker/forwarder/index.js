/* global process */
const Forwarder = require("./forwarder")
const logger = require("../../common/logger")
const config = require("../../config/exporter")

/**
 * This is basically a http client, which is reading some configuration and trying to read
 * topics from the configured databases and forward it to the configured communication partners.
 */

logger.info("Hello Forwarder!")
try {
    const forwarder = Forwarder(config)
    forwarder.start()
}
catch (error) {
    logger.error("exporter: " + error)
    process.exit(1)
}