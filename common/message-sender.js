const logger = require("./logger")
const Joi = require("joi")
const PouchDB = require("pouchdb")
const path = require("path")

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
 * A message sender allows to send a message to the configured topic. In fact, the message is
 * just stored into the configured database. A forwarder, checking the database, will care to 
 * forward the message.
 * The responisibility of the sender is basically to create a unique sequence number and manage
 * this.
 * 
 * @todo An interface, which retrieves the sequence number from the whole system is needed!
 * 
 * @author Dr. Ralf Berger (c) 2018, 2019
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
        this.messageDb = new PouchDB(this._calculateMessageDbLocation())
    }

    /**
     * Wraps the message in the message envelope, store it into the queue database and trigger to send it.
     * @param {*} message The message to be send.
     * @returns A promise, which succeeds, as soon as the message is in the queue database.
     */
    async send(topic, message) {
        logger.debug(`MessageSender.send(): topic=${topic} message.name=${message.name}`)
        const that = this
        let wrappedMessage = await this._wrapMessage(topic, message)
        return await that._saveMessage(wrappedMessage)
    }

    /**
     * Calculates the message database location.
     */
    _calculateMessageDbLocation() {
        const result = path.format({dir: path.format({dir: this.config["database-url"], base: "messages"}), base: this.config["topic"]})
        logger.debug(`MessageSender.constructor(): Initializing message database on: ${result}`)
        return result
    }

    /**
     * Initializes the bookkeeping of the sequence number.
     */
    async _initBookkeeping() {
        logger.debug("MessageSender._initBookkeeping()")
        this.bookkeepingDb = new PouchDB(this.config["database-url"] + "/bookkeeping")

        try {
            // Check, if the bookkeeping information is already available
            this.sequenceNoData = await this.bookkeepingDb.get("sequence-no")
        }
        catch (error) {
            // If no, create the initial bookkeeping information and store this in the bookkeeping store.
            try {
                logger.debug("MessasgeSender._initBookkeeping(): Setting up new sequence number document...")
                await this.bookkeepingDb.put({
                    _id: "sequence-no",
                    "sequence-no": 0
                })
                logger.debug("MessasgeSender._initBookkeeping(): Sequence number successfully initialized.")
                this.sequenceNoData = await this.bookkeepingDb.get("sequence-no")
            }
            catch (error) {
                logger.error(`MessageSender._initBookkeeping(): Cannot initialize sequence number due to: ${error}`)
                throw error
            }
        }
    }

    /**
     * Increments the sequence number not only in the receiver, but also in the database.
     * @returns A promise, which resolves, if it was possible to update the database.
     */
    async _incrementSequenceNo() {
        const that = this
        this.sequenceNoData["sequence-no"]++
        return await that.bookkeepingDb.put(that.sequenceNoData).then((result) => {
            that.sequenceNoData._rev = result.rev
        })
    }

    /**
     * Each message comes with an envelope, which contains the originator, the topic and a unique
     * sequence number.
     * @param topic The topic of the message.
     * @param message The message itself.
     * @returns A promise, which resolves, after the sequence number is persisted successfully.
     */
    async _wrapMessage(topic, message) {
        const wrappedMessage = {
            originator: this.config["originator"],
            topic: topic,
            message: message
        }
        if (!this.sequenceNoData) {
            await this._initBookkeeping()
        }
        await this._setSequenceNo(wrappedMessage)
        return wrappedMessage
    }

    /**
     * The sequence number of a message must be continuously growing without gaps. This method
     * returns only, using the resolve and the reject functions. In the case of success the
     * resolved function will return the wrappedMessage, with the sequence-no and a new _id set.
     * @param wrappedMessage The messages with meta data.
     */
    async _setSequenceNo(wrappedMessage) {
        logger.debug(`MessageSender._setSequenceNo(): ${this.sequenceNoData["sequence-no"]}`)
        wrappedMessage["_id"] = `${this.config["originator"]}-${this.sequenceNoData["sequence-no"]}`
        wrappedMessage["sequence-no"] = this.sequenceNoData["sequence-no"]
        logger.debug(`MessageSender._setSequenceNo(): _id=${wrappedMessage._id} seq-no=${wrappedMessage["sequence-no"]}`)
        return await this._incrementSequenceNo()
    }

    /**
     * Saves the message document in the queue database.
     * @param messageDocument
     * @returns A promise, which resolves, if the message is successful saved in the database.
     */
    _saveMessage(messageDocument) {
        logger.debug(`MessageSender._saveMessage(): document=${messageDocument}`)
        return this.messageDb.put(messageDocument)
    }
}

module.exports = MessageSender