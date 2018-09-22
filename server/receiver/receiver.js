const Promise = require("promise")
const http2 = require("http2")
const fs = require("fs")
const PouchDB = require("pouchdb")
const logger = require("../../common/logger")
const Server = require("../server")
const calculateId = require("./calculate-id")
const validateConfiguration = require("./validate-configuration")
const validateParameters = require("./validate-parameters")

/**
 * This is the core of the receiver implementation. It provides the methods
 * to handle the different requests, comming from the http2 connection and
 * brings it together with the configuration.
 * 
 * @author Dr. Ralf Berger <dr.ralf.berger@gmail.com>
 */
class Receiver extends Server {

    /**
     * Initialize the configuration data. These data will be validated first.
     * A receiver can only exists after successful validation of the configuartion.
     * @param {#} config The configuratio of the receiver.
     */
    constructor(config) {
        super(config)
        validateConfiguration(config)
        this.databases = {}
        this.createServer()
    }

    /**
     * Prepare everything for the operation of the receiver server.
     */
    createServer() {
        const that = this   // Overcome the JS scoping glitch
        this.server = http2.createSecureServer({
            key: fs.readFileSync(this.config["key-location"]),
            cert: fs.readFileSync(this.config["cert-location"])
        })
        // Register the callacks for the important server events.
        this.server.on("error", (err) => logger.error(err))
        this.server.on("stream", (stream, headers) => that.handleRequest(stream, headers))
    }

    /**
     * Central entrypoint for all requests for the http2 server created in the createServer method.
     * @param {Http2Stream} stream The duplex stream for receiving requests and providing response.
     * @param {*} headers The http2 headers object.
     */
    handleRequest(stream, headers) {
        const method = headers[":method"]
        const path = headers[":path"]
        logger.debug(`Receiver.createServer(): received request: "${method}": "${path}"`)
    
        if (method === "GET" && path === "/status") {
            this.handleStatusRequest(path, stream)
        }
        else if (method === "POST" && path === "/") {
            this.handlePostRequest(path, stream)
        }
        else {
            this.handleNotSupportedRequest(method, path, stream)
        }
    }

    /**
     * Provides an stringified JSON response.
     * @param {Http2Stream} stream The stream on which we should response.
     * @param {number} status The http status number.
     * @param {string} message The message, which describes the status.
     */
    jsonStatusResponse(stream, status, message) {
        stream.respond({
            "content-type": "application/json",
            ":status": status
        })
        stream.end(JSON.stringify({
            "status": status, 
            "description": message
        }))
    }

    /**
     * Handles the status request.
     * @param {string} path The path, the client tries to access.
     * @param {Http2Stream} stream The stream, which connects the receiver with the client.
     */
    handleStatusRequest(path, stream) {
        if (path !== "/status") {
            logger.error(`receiver.handleStatusRequest(): try to access invalid path: "${path}"`)
            this.jsonStatusResponse(stream, 401, "Attempt to access non existing path!")
        }
        else {
            logger.info("receiver.GET /status")
            this.jsonStatusResponse(stream, 200, "Receiver running all dependencies Ok!")
        }
    }

    /**
     * Handles the POST request.
     * @param {string} path The path, the client tries to access.
     * @param {Http2Stream} stream The stream, which connects the receiver with the client.
     */
    handlePostRequest(path, stream) {
        let that = this // Overcome the JavaScript scoping glitch.
        logger.info("receiver.POST")
        if (path !== "/") {
            this.handleNotSupportedRequest("POST", path, stream)
            return
        }
        this.dataString = ""
        stream.on("data", (chunk) => {
            that.dataString += chunk
            logger.info("Receiver.handlePostRequest(): received data chunk: " + chunk)
        })
        stream.on("end", () => {
            logger.debug("Receiver.handPostRequest(): receied end of data!")
            try {
                let data = JSON.parse(that.dataString)
                validateParameters(data, that.config)
                data._id = calculateId(data)
                data.hops = !data.hops ? 1 : data.hops+1
                if (data.hops > that.config["max-hops"]) {
                    logger.info("Receiver.handlePostRequest(): Droping message with too many hops.")
                }
                else {
                    that.storeData(data)
                        .then(() => {
                            logger.debug("Receiver.handlePostRequest(): Data stored successfully.")
                            that.jsonStatusResponse(stream, 200, "Stored successfully!")
                        })
                        .catch((error) => {
                            logger.error("Receiver.handlePostRequest(): Store data not possible due to: " + error)
                            that.jsonStatusResponse(stream, 503, "Error storing data: " + error)
                        })
                }
            }
            catch (e) {
                logger.error("Receiver.handlePostRequest(): " + e)
                that.jsonStatusResponse(stream, 503, "Error parsing data: " + e)
            }
        })
    }

    /**
     * Store the given data into the database of the topic.
     * @param {*} data The 'document' to be stored.
     * @returns A promise.
     */
    storeData(data) {
        return this.getDb(data.topic).put(data)
    }

    /**
     * Provides the database instance, which is connected with the given topic. If the instance
     * don't exist a new one will be created and returned.
     * @param {string} topicName The name of the topic, which should be stored into the database.
     */
    getDb(topicName) {
        if (!this.databases[topicName]) {
            let databaseLocation = `${this.config["database-url"]}/${topicName}`
            logger.debug(`Receiver.createDb(${topicName}): databaseLocation="${databaseLocation}"`)
            this.databases[topicName] = new PouchDB(databaseLocation)
        }
        return this.databases[topicName]
    }

    /**
     * Returns a error to the client.
     * @param {string} method The request method.
     * @param {string} path The path, the client tries to access.
     * @param {Http2Stream} stream The stream, which connects the receiver with the client.
     */
    handleNotSupportedRequest(method, path, stream) {
        logger.warn(`receiver: Not accepted connection attempt: ${method} to "${path}" ignored!`)
        this.jsonStatusResponse(stream, 503, "Receiver request not supported!")
    }

    /**
     * Closes all databases.
     */
    close() {
        const that = this
        return new Promise((resolve) => {
            let closedDbs = 0
            let databaseCount = 0
            // Iterate over all databases and close them
            for (let dbName in that.databases) {
                databaseCount++
                that.databases[dbName].close()
                    .then(() => {
                        closedDbs++
                        if (closedDbs === databaseCount) {
                            resolve()
                        }
                    })
                    .catch(() => {
                        closedDbs++
                        if (closedDbs === databaseCount) {
                            resolve()
                        }
                    })
            }
        })
    }
}

module.exports = Receiver