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

    /**
     * Checks the status of the circuite breaker and serves the service function
     * or the fallback function accordingly.
     * @returns A promise, which resolves by the service function or with the 
     *          result of the fallback function.
     */
    service() {
        if (this.state === "open" 
            && this.timestamp + this.options.resetTimeout < Date.now()) {
            this._halfOpen()
        }
        if (this.state === "closed") {
            return this._handleClosed()
        }
        else if (this.state === "open") {
            return this._handleOpen()
        }
        else {
            return this._handleHalfOpen()
        }
    }

    /**
     * Wrapps the result of the service function and changes the status according of the number of 
     * consecutive failures.
     */
    _handleClosed() {
        const that = this
        return new Promise((resolve, reject) => {
            that.serviceFctn().then((value) => {
                that.failures = 0
                resolve(value)
            }).catch((error) => {
                logger.warn(`CircuitBreaker.service() service rejected in "${that.state}" state with ${error}`)
                that.failures++
                if (that.failures >= that.options.maxFailures) {
                    that._open()
                }
                reject(error)
            })
        })
    }

    /**
     * Checks, if the provided object is a promise. As there is no real typecheck available, the availability of
     * a then() *and* catch() method is checked.
     * @param {any} object The object to check.
     * @returns true, if the object is a promise.
     */
    _isPromise(object) {
        return !!object 
            && (typeof object === "object" || typeof object === "function") 
            && (typeof object.then === "function" && typeof object.catch === "function")
    }

    /**
     * @returns A new promise, which resolves with the result of the fallback function.
     */
    _handleOpen() {
        const result = this.fallbackFctn()
        if (this._isPromise(result)) {
            return result
        }
        return new Promise((resolve) => {
            resolve(result)
        })
    }

    /**
     * Tries to execute the service again. If this fails, it changes again to open. Otherwise it +
     * will close the circuit again.
     * @returns A promise, which resolves with the result of the service function.
     */
    _handleHalfOpen() {
        const that = this
        return new Promise((resolve, reject) => {
            that.serviceFctn().then((value) => {
                that._close()
                resolve(value)
            }).catch((error) => {
                logger.warn(`CircuitBreaker.service() service still rejected in "${that.state}" state with ${error}`)
                that._open()
                reject(error)
            })
        })
    }

    /**
     * Changes the circuit breaker to the open state, resetting the timestamp in this.
     */
    _open() {
        logger.warn("CircuitBreaker._open(): failure count exceeded -> OPEN")
        this.state = "open"
        this.timestamp = Date.now()
    }

    /**
     * Closes the circuit, resetting the numbers of failures in this.
     */
    _close() {
        logger.info("CircuitBreaker._close(): goes back to normal.")
        this.state = "closed"
        this.failures = 0
    }

    /**
     * Goes to the status, where we can retry to connect.
     */
    _halfOpen() {
        logger.info("CircuitBreaker._halfOpen(): tries to go back to normal.")
        this.state = "half open"
    }
}

module.exports = CircuitBreaker