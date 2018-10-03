const Joi = require("joi")
const logger = require("../../common/logger")

const configSchema = Joi.object().keys({
    "name": Joi.string().hostname().required(),
    "id": Joi.string().required(),
    "topic": Joi.string().required(),
    "originators": Joi.array().required(),
    "database-url": Joi.string().required(),
    "limit": Joi.number().integer().min(1).max(65000),
    "interval": Joi.number().integer().min(10),
    "export-dir": Joi.string().required(),
    "exported-store": Joi.string().required()
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