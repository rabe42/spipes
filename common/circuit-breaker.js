const logger = require("./logger")
const Joi = require("joi")
const Promise = require("promise")

const defaultOptions = {
    maxFailures: 5,         // Maximum number of failures until the circuit opens.
    timeout: 60000,         // The timeout which qualifies as a failure.
    resetTimeout: 360000    // The timeout used to close the circuit again.
}

const optionsSchema = Joi.object().keys({
    "name": Joi.string().required(),
    "maxFailures": Joi.number().integer().min(1).optional(),
    "timeout": Joi.number().integer().optional(),
    "resetTimeout": Joi.number().integer().optional()
})

/**
 * A circuit breaker, which encapsulates a function returning a promise.
 * Two functions must be provided. The service function, can be called from the
 * circuit breaker. This function will manage the opening and closing of the 
 * circuit according to the definition by Nygard/Fowler.
 * 
 * @author Dr. Ralf Berger
 */
class CircuitBreaker {

    /**
     * Creates a circuit breaker for the provided function with the provided options.
     * @param fctn A function, which will return a promise.
     * @param fallbackFctn A function, which is called while the circuit is open.
     * @param options The options, which control the behaviour.
     */
    constructor(serviceFctn, fallbackFctn, options) {
        logger.debug("CircuitBreaker.constructor(): Creating...")
        if (!serviceFctn || (typeof serviceFctn !== "function")) {
            throw new Error("service function must be provided.")
        }
        if (!fallbackFctn || (typeof fallbackFctn !== "function")) {
            throw new Error("fallback function must be provided.")
        }
        Joi.validate(options, optionsSchema, (err) => {
            if (err !== null) {
                logger.error(`MessageSender(): "${err}"`)
                throw new Error(`Error during validation of the configuration: ${err}`)
            }
        })
        this.serviceFctn = serviceFctn
        this.fallbackFctn = fallbackFctn
        this.options = Object.assign({}, defaultOptions, options)
        this._close()
    }

    service() {
        const that = this
        if (this.state === "open" 
            && this.timestamp + this.options.resetTimeout < Date.now()) {
            this._halfOpen()
        }
        if (this.state === "closed") {
            return this._handleClosed()
        }
        else if (this.state === "open") {
            return new Promise((resolve) => { 
                resolve(this.fallbackFctn())
            })
        }
        else {
            return new Promise((resolve, reject) => {
                that.serviceFctn().then((value) => {
                    that._close()
                    resolve(value)
                }).catch((error) => {
                    logger.warn(`CircuitBreaker.service() service rejected in "${that.state}" state with ${error}`)
                    that._open()
                    reject(error)
                })
            })
        }
    }

    _handleClosed() {
        return new Promise((resolve, reject) => {
            this.serviceFctn().then((value) => {
                this.failures = 0
                resolve(value)
            }).catch((error) => {
                logger.warn(`CircuitBreaker.service() service rejected in "${this.state}" state with ${error}`)
                this.failures++
                if (this.failures >= this.options.maxFailures) {
                    this._open()
                }
                reject(error)
            })
        })
    }

    _open() {
        logger.warn("CircuitBreaker._open(): failure count exceeded -> OPEN")
        this.state = "open"
        this.timestamp = Date.now()
    }

    _close() {
        logger.info("CircuitBreaker._close(): goes back to normal.")
        this.state = "closed"
        this.failures = 0
    }

    _halfOpen() {
        logger.info("CircuitBreaker._halfOpen(): tries to go back to normal.")
        this.state = "half open"
    }
}

module.exports = CircuitBreaker