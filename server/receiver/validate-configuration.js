const Joi = require("joi")
const logger = require("../../common/logger")

/**
 * Descripes the data structure to define the different topics.
 * A topic represents a stream of documents, which should be buffered at this receiver.
 * A topic can be only received from a defined set of hosts.
 */
const topicSchema = Joi.object().keys({
    "name": Joi.string().required(),
    "hosts": Joi.array().items(Joi.string().hostname()).min(1).required()
})

/**
 * The configuration schema.
 */
const configSchema = Joi.object().keys({
    "name": Joi.string().hostname().required(),
    "port": Joi.number().integer().min(0).max(65000).strict().required(),
    "key-location": Joi.string().regex(/^[-/\w.]+\.[-\w]{1,64}/).required(),
    "cert-location": Joi.string().regex(/^[-/\w.]+\.[-\w]{1,64}/).required(),
    "acceptedTopics": Joi.array().items(topicSchema).min(1).unique().required(),
    "database-url": Joi.string().required(), // Can be also an URI
    "maxDocumentSizeBytes": Joi.number().integer().required()
})

/**
 * Validates, that all configuration parameters are provided.
 * 
 * @param {JSON} config The config, which should follow the configSchema.
 */
function validateConfiguration(config) {
    Joi.validate(config, configSchema, (err) => {
        if (err !== null) {
            logger.error(`receiver.validateConfiguration(): "${err}"`)
            throw new Error("Error during validation of the configuration: " + err)
        }
    })
}

module.exports = validateConfiguration