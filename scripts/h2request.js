/* global */
/**
 * This is a put or post h2 request client.
 * 
 * This client is intended to be used for test purposes only.
 * 
 * @author Dr. Ralf Berger (c) 2018
 */

const http2 = require("http2")
const fs = require("fs")
const Promise = require("promise")
const winston = require("winston")
winston.add(new winston.transports.Console())

/**
 * Executes a single h2request to a h2 based service.
 * @param {string} url The protocol, hostname and port of the service.
 * @param {string} method The method POST or PUT.
 * @param {string} path The service path.
 * @param {string} body The body of the request.
 * @returns A promise with the data in case of success.
 */
function h2request(certLocation, url, method, path, body) {
    return new Promise((resolve, reject) => {
        const h2session = http2.connect(url, {
            ca: fs.readFileSync(certLocation)
        })
        h2session.on("error", (err) => {
            winston.error(`h2request(): error - Exiting h2 client with error: ${err}`)
            reject(err)
        })
        h2session.on("close", () => {
            winston.info("h2request(): close - exiting h2 client.")
            reject(new Error("Stream was closed unexpectedly!"))
        })
        
        const req = h2session.request({ ":path": path, ":method": method, "content-length": body.length, "content-type": "application/json" })
        
        req.on("response", (headers /*, flags */) => {
            for (const name in headers) {
                winston.debug(`h2request(): response.header.${name}: ${headers[name]}`)
            }
        })
        
        req.setEncoding("utf8")
        let data = ""
        req.on("data", (chunk) => { data += chunk })
        req.on("end", function () {
            winston.debug(`h2request(): received data: ${data}`)
            resolve(data)
        })
        req.write(body)
        req.end()
    })
}

module.exports = h2request