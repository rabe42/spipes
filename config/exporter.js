/* global process */

const configuration = {
    "name": process.env.HOSTNAME || "localhost",
    "topic": process.env.TOPIC || "transaction",
    "database-url": process.env.DB || "ex-db",
    "limit": process.env.LIMIT || 10,
    "interval": process.env.INTERVAL || 500,
    "export-dir": process.env.EXPORT_DIR || "./export",
    "error-dir": process.env.ERROR_DIR || "./error"
}

module.exports = configuration