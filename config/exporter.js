/* global process */

const configuration = {
    "name": process.env.HOSTNAME || "localhost",
    "topic": "transaction",
    "database-url": "db",
    "limit": 10,
    "interval": 500,
    "export-dir": "./export",
    "error-dir": "./error"
}

module.exports = configuration