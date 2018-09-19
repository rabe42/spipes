/* global process */
const logger = require("../../common/logger")
const Exporter = require("./exporter")
const config = require("../../config/exporter")

logger.info("Hello Exporter!")
try {
    const exporter = Exporter(config)
    exporter.start()
}
catch (error) {
    logger.error("exporter: " + error)
    process.exit(1)
}