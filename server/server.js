const logger = require("../common/logger")

class Server {
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
        if (!this.server) {
            logger.error("Server.start(): Server not defined!")
            throw new Error("Server not defined!")
        }
        logger.info(`Server.start(): Start listening: ${this.config.port}`)
        this.server.listen(this.config.port)
    }
}

module.exports = Server