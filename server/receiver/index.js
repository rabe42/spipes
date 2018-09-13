/* global process */
const logger = require("./logger")
const config = require("../../config/receiver")

const Receiver = require("./receiver")

try {
    let receiver = new Receiver(config)
    receiver.start()
}
catch (err) {
    logger.error("receiver: " + err)
    process.exit(1)
}
logger.info("receiver: Exiting process gracefully!")