/* global process */

module.exports = {
    "name": process.env.HOSTNAME || "localhost",
    "topic": process.env.TOPIC || "config",
    "hosts": [
        {"host": "fqdn", "port": 3000, key: "yxd"},
        {"host": "fqdn", "port": 2000, key: "asdf"}
    ],
    "database-url": process.env.DB || "db",
    "limit": process.env.LIMIT || 10,
    "interval": process.env.INTERVAL || 500,
}
