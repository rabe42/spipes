/* global process */
/**
 * This is a minimal http2 client for the GET method, as it is documented in the nodejs
 * API documentation. Main difference to the documentation, is the use of the configuration
 * stored in the config folder and the command line argument to extract an optional 
 * path from it.
 * 
 * This client is intended to be used for test purposes only.
 * 
 * @author Dr. Ralf Berger (c) 2018
 */

const http2 = require("http2")
const fs = require("fs")
const config = require("../config/receiver")
const winston = require("winston")
winston.add(new winston.transports.Console())

let path = "/status"
winston.debug(`The command line arguments: ${process.argv} length: ${process.argv.length}`)
if (process.argv.length === 3) {
    path = process.argv[2]
}

const h2session = http2.connect(`https://localhost:${config.port}`, {
    ca: fs.readFileSync(config.certLocation)
})
h2session.on("error", (err) => {
    winston.error(`Exiting h2get client with error: ${err}`)
    process.exit(1)
})
h2session.on("close", () => {
    winston.info("Exiting h2get client.")
    process.exit(0)
})

const req = h2session.request({ ":path": path, ":method": "GET" })

req.on("response", (headers /*, flags */) => {
    for (const name in headers) {
        winston.info(`${name}: ${headers[name]}`)
    }
})

req.setEncoding("utf8")
let data = ""
req.on("data", (chunk) => { data += chunk })
req.on("end", () => {
    winston.info(`\n${data}`)
})
req.end()