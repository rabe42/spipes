const Joi = require("joi")
const logger = require("../../common/logger")

const hostSchema = Joi.object().keys({
    "host": Joi.string().hostname().required(),
    "port": Joi.number().integer().min(1).max(65000),
    "certificate": Joi.string().required()
})

const configSchema = Joi.object().keys({
    "name": Joi.string().hostname().required(),
    "topic": Joi.string().required(),
    "host": hostSchema,
    "database-url": Joi.string().required(),
    "limit": Joi.number().integer().min(1).max(65000),
    "interval": Joi.number().integer().min(10),
})

function validateConfiguration(config) {
    Joi.validate(config, configSchema, (err) => {
        if (err !== null) {
            logger.error(`exporter.validateConfiguration(): "${err}"`)
            throw new Error(`Error during validation of the configuration: ${err}`)
        }
    })
}

module.exports = validateConfiguration