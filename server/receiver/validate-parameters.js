const Joi = require("joi")
const logger = require("../../common/logger")

/*
{
    "originator": "fqdn.node.name",
    "destination": "fqdn.node.name",
    "sequence-no": number
    "content-type": "mime-type",
    "topic": "topic-name",
    "data": BLOB
}
*/
const schema = Joi.object().keys({
    "originator": Joi.string().hostname().required(),
    "destination": Joi.string().hostname().required(),
    "sequence-no": Joi.number().required(),
    "content-type": Joi.string(),
    "topic": Joi.string().required(),
    "data": Joi.string()
})

/**
 * Validates parameters in a POST request.
 * @param {*} parameters The parameters to be validated.
 * @param {*} configuration A valid receiver configuration.
 */
function validateParameters(parameters, configuration) {
    let allCheckedParametersValidated = true
    Joi.validate(parameters, schema, (err) => {
        if (err !== null) {
            logger.error(`receiver.validateParameters(): "${err}"`)
            allCheckedParametersValidated = false
        }
    })
    if (!allCheckedParametersValidated) {
        throw new Error("Parameters cannot be validated.")
    }
    validateTopic(configuration, parameters.topic)
}

/**
 * Validates the topic against the configuration.
 * @param {*} configuration A validated receiver configuration.
 * @param {string} topicName The name of the topic.
 */
function validateTopic(configuration, topicName) {
    for (let i = 0; i < configuration["accepted-topics"].length; i++) {
        if (configuration["accepted-topics"][i].name === topicName) {
            return
        }
    }
    throw new Error(`Topic "${topicName}" not accepted!`)
}

module.exports = validateParameters