const http2 = require("http2")
const winston = require("winston")

/**
 * This is basically a http client, which is reading some configuration and trying to read
 * topics from the configured databases and forward it to the configured communication partners.
 */

const client = http2.connect("https://localhost:3000/")

client.on("error", (err) => { winston.log("error", err) })

