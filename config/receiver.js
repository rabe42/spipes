/* global __dirname */
const path = require("path")

const configuration = {
    "name": "receiver",
    "port": 3000,
    "key-location": path.normalize(__dirname + "../../server.key"),
    "certLocation": path.normalize(__dirname + "../../server.crt"),
    "database-url": "db",
    "maxDocumentSizeBytes": 2097152,
    "acceptedTopics": [
        {name: "transaction", hosts: ["localhost", "::1", "::ffff:127.0.0.1"]},
        {name: "configuration", hosts: ["localhost", "::1"]}
    ]
}

module.exports = configuration