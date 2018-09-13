/* global process */
/**
 * This is a minimal http2 client for the POST method.
 * 
 * This client is intended to be used for test purposes only.
 * 
 * @author Dr. Ralf Berger (c) 2018
 */

const config = require("../config/receiver")
const h2request = require("./h2request")
const winston = require("winston")
winston.add(new winston.transports.Console())

const method = "POST"
let path = "/status"

//-- Preparation of the content
let bodyString = JSON.stringify({
    originator: "localhost",
    destination: "server", 
    "sequence-no": 200, 
    topic: "transaction", 
    data: "My data"})
//--

winston.debug(`The command line arguments: ${process.argv} length: ${process.argv.length}`)
if (process.argv.length === 3) {
    path = process.argv[2]
}

h2request(config.certLocation, `https://localhost:${config.port}`, method, path, bodyString)
    .then(data => {
        if (data !== undefined) {
            winston.info(`\n${data}`)
        }
    })
    .catch(err => {
        winston.error(err)
    })

module.exports = h2request