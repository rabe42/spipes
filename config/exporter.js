/* global process */

const configuration = {
    "name": process.env.HOSTNAME || "localhost",
    "id": process.env.ID || "1",
    "originators": process.env.ORIGS || ["localhost"],
    "topic": process.env.TOPIC || "transaction",
    "database-url": process.env.DB || "ex-db",
    "limit": process.env.LIMIT || 10,
    "interval": process.env.INTERVAL || 500,
    "export-dir": process.env.EXPORT_DIR || "./export",
    "exported-store": process.env.EXPORTED || "exported"
}

module.exports = configuration