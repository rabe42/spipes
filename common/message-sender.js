const logger = require("./logger")
const Joi = require("joi")
const Promise = require("promise")
const PouchDB = require("pouchdb")

const hostSchema = Joi.object().keys({
    "host": Joi.string().hostname().required(),
    "port": Joi.number().integer().min(1).max(65000),
    "certificate": Joi.string().required()
})

const configSchema = Joi.object().keys({
    "originator": Joi.string().uri({scheme: ["spipe"]}).required(),
    "topic": Joi.string().required(),
    "host": hostSchema,
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

    /**
     * Checks the configuration of completeness and initializes the database for message buffering.
     * @param config The configuration for the sender.
     */
    constructor(config) {
        Joi.validate(config, configSchema, (err) => {
            if (err !== null) {
                logger.error(`MessageSender(): "${err}"`)
                throw new Error(`Error during validation of the configuration: ${err}`)
            }
        })
        this.config = config
        this.messageDb = new PouchDB(config["database-url"] + "/messages")
    }

    /**
     * Wraps the message in the message envelope, store it into the queue database and trigger to send it.
     * @param {*} message The message to be send.
     * @returns A promise, which succeeds, as soon as the message is in the queue database.
     */
    send(destination, topic, message) {
        const that = this
        return this._wrapMessage(destination, topic, message).then((wrappedMessage) => {
            return that._saveMessage(wrappedMessage)
        })
    }

    /**
     * Initializes the bookkeeping, right now only the storage of a sequence number for this
     * originator.
     * @returns A promise, which is resolved, if the persistent bookkeeping information can be retrieved and used.
     */
    _initializeBookkeeping() {
        logger.debug("MessageSender._initializeBookkeeping()")
        const that = this
        this.bookkeepingDb = new PouchDB(this.config["database-url"] + "/bookkeeping")
        return new Promise((resolve, reject) => {
            this.bookkeepingDb.get("sequence-no").then((data) => {
                logger.debug("MessageSender._initializeBookkeeping(): Successful retrieved a sequence number from history.")
                resolve(data)
            }).catch(() => {
                logger.debug("MessageSender._initializeBookkeeping(): Setting up new sequence number document...")
                that.bookkeepingDb.put({
                    _id: "sequence-no",
                    "sequence-no": 0
                }).then(() => {
                    logger.debug("MessageSender._initializeBookkeeping(): Successful setup of new sequence number.")
                    return that.bookkeepingDb.get("sequence-no").then((data) => {
                        logger.debug("MessageSender._initializeBookkeeping(): New sequence-no successful retrieved.")
                        that.sequenceNoData = data
                        resolve(data)
                    })
                }).catch((error) => {
                    logger.error(`MessageSender._initializeBookkeeping(): Error setting up new sequence number: ${error}`)
                    reject(error)
                })
            })
        })
    }

    /**
     * Increments the sequence number not only in the receiver, but also in the database.
     * @returns A promise, which resolves, if it was possible to update the database.
     */
    _incrementSequenceNo() {
        this.sequenceNoData["sequence-no"]++
        return this.bookkeepingDb.put(this.sequenceNoData)
    }

    /**
     * Each message comes with an envelope, which contains the originator, the destination, the topic and a unique
     * sequence number.
     * @param destination The destination of the message.
     * @param topic The topic of the message.
     * @param message The message itself.
     * @returns A promise, which resolves, after the sequence number is persisted successfully.
     */
    _wrapMessage(destination, topic, message) {
        const that = this
        return new Promise((resolve, reject) => {
            const wrappedMessage = {
                originator: this.config["originator"],
                destination: destination,
                topic: topic,
                message: message
            }
            if (that.bookkeepingDb) {
                that._setSequenceNo(wrappedMessage, resolve, reject)
            }
            else {
                that._initializeBookkeeping().then(() => {
                    that._setSequenceNo(wrappedMessage, resolve, reject)
                }).catch((error) => {
                    logger.error(`MessageSender._wrapMessage(): failed to initialize bookkeeping due to: ${error}`)
                    reject(error)
                })
            }
        })
    }

    /**
     * The sequence number of a message must be continuously growing without gaps.
     * @param wrappedMessage The messages with meta data.
     * @param resolve The function to call to resolve a promise.
     * @param reject The function to call to reject a promise.
     */
    _setSequenceNo(wrappedMessage, resolve, reject) {
        logger.debug(`MessageSender._setSequenceNo(): ${this.sequenceNoData["sequence-no"]}`)
        wrappedMessage["_id"] = `${this.config["originator"]}-${this.sequenceNoData["sequence-no"]}`
        wrappedMessage["sequence-no"] = this.sequenceNoData["sequence-no"]
        this._incrementSequenceNo().then(() => {
            logger.debug("MessageSender._setSequenceNo(): successful.")
            resolve(wrappedMessage)
        }).catch((error) => {
            logger.error(`MessageSender._setSequenceNo(): Not able to set sequence number because of: ${error}`)
            reject(error)
        })
    }

    /**
     * Saves the message document in the queue database.
     * @param messageDocument
     * @returns A promise, which resolves, if the message is successful saved in the database.
     */
    _saveMessage(messageDocument) {
        return this.messageDb.put(messageDocument)
    }

    /**
     * Try to send the content from the database. If there is something, it
     * will retry immediately, if not it will sleep for some time and try it again.
     */
    _sendFromQueue() {

    }
}

module.exports = MessageSender