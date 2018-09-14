/* global process */

const configuration = {
    "name": process.env.HOSTNAME || "localhost",
    "topic": "transaction",
    "databaseUrl": "db",
    "limit": 10,
    "export-dir": "./export",
    "error-dir": "./error"
}

module.exports = configuration