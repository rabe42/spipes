const logger = require("../common/logger")

class Worker {
    constructor(config) {
        if (!config) {
            throw new Error("No configuration provided!")
        }
        this.config = config
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