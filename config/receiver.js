/* global __dirname process */
const path = require("path")

const configuration = {
    "name": process.env.NAME || "receiver",
    "port": process.env.PORT || 3000,
    "key-location": process.env.KEY_FILE || path.normalize(__dirname + "../../server.key"),
    "cert-location": process.env.CERT_FILE || path.normalize(__dirname + "../../server.crt"),
    "database-url": process.env.DB || "db",
    "maxDocumentSizeBytes": process.env.MAX_SIZE || 2097152,
    "accepted-topics": [
        {name: "transaction", hosts: ["localhost", "::1", "::ffff:127.0.0.1"]},
        {name: "configuration", hosts: ["localhost", "::1"]}
    ]
}

module.exports = configuration