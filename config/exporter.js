/* global process */

const configuration = {
    "name": process.env.HOSTNAME || "localhost",            // This information is used to identify, if the message is targetet for this node.
    "id": process.env.ID || "1",                            // This information is needed to store the bookkeeping information of this node.
    "originators": process.env.ORIGS || ["localhost"],      // This information is needed to identify, if all previous messages are received and the current message can be exported.
    "topic": process.env.TOPIC || "transaction",
    "database-url": process.env.DB || "ex-db",
    "limit": process.env.LIMIT || 10,
    "interval": process.env.INTERVAL || 500,
    "export-dir": process.env.EXPORT_DIR || "./export",
    "exported-store": process.env.EXPORTED || "_exported_"
}

module.exports = configuration