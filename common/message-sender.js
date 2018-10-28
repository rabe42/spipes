const logger = require("./logger")
const Joi = require("joi")

const hostSchema = Joi.object().keys({
    "host": Joi.string().hostname().required(),
    "port": Joi.number().integer().min(1).max(65000),
    "certificate": Joi.string().required()
})

const configSchema = Joi.object().keys({
    "originator": Joi.string().uri({scheme: ["spipe"]}).required(),
    "topic": Joi.string().required(),
    "hosts": Joi.array().items(hostSchema).min(1).unique().required(),
    "database-url": Joi.string().required(),
    "limit": Joi.number().integer().min(1).max(65000),
    "interval": Joi.number().integer().min(10),
})

/**
 * A message sender allows to send a message to all configured hosts. It encapsulates the number of 
 * hops and is configured, like the rest of the framework with an configuration object.
 * 
 * @author Dr. Ralf Berger (c) 2018
 */
class MessageSender {
    constructor(config) {

        Joi.validate(config, configSchema, (err) => {
            if (err !== null) {
                logger.error(`exporter.validateConfiguration(): "${err}"`)
                throw new Error(`Error during validation of the configuration: ${err}`)
            }
        })
        this.config = config
    }
}

module.exports = MessageSender