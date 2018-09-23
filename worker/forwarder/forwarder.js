const Worker = require("../worker")
const validateConfiguration = require("./validate-configuration")

class Forwarder extends Worker {

    constructor(config) {
        super(config)
        validateConfiguration(config)
    }
}

module.exports = Forwarder