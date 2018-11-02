const logger = require("./logger")
const Joi = require("joi")

const defaultOptions = {
    maxFailures: 5,         // Maximum number of failures until the circuit opens
    timeout: 60000,         // The timeout which qualifies as a failure
    resetTimeout: 360000    // The timeout used to close the circuit again.
}

const optionsSchema = Joi.object().keys({
    "maxFailures": Joi.number().integer().min(1),
    "timeout": Joi.number().integer().required(),
    "resetTimeout": Joi.number().integer().required()
})

/**
 * A circuit breaker, which encapsulates a function returning a promise.
 * 
 * @author Dr. Ralf Berger
 */
class CircuitBreaker {

    /**
     * Creates a circuit breaker for the provided function with the provided options.
     * @param fktn A function, which will return a promise.
     * @param options The options, which control the behaviour.
     */
    constructor(fktn, options) {
        logger.debug("CircuitBreaker.constructor(): Creating.")
        this.fktn = fktn
        this.options = defaultOptions
        if (options) {
            // Validate them...
            Joi.validate(options, optionsSchema, (err) => {
                if (err !== null) {
                    logger.error(`MessageSender(): "${err}"`)
                    throw new Error(`Error during validation of the configuration: ${err}`)
                }
            })
            this.options = options
        }
    }
}

module.exports = CircuitBreaker