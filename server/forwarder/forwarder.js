const Server = require("../server")
const validateConfiguration = require("./validate-configuration")

class Forwarder extends Server {

    constructor(config) {
        super(config)
        validateConfiguration(config)
    }
}

module.exports = Forwarder