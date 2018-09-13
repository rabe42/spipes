/* global process */
const winston = require("winston")

const tsFormat = winston.format.printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level.toUpperCase()} ${info.message}`
})

/**
 * The standard logger
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "debug",
    format: winston.format.combine(
        winston.format.label({label: process.env.PROCESS_TYPE || "spipes"}),
        winston.format.timestamp(), tsFormat
    ),
})    

// Add the transports to the logger, depending on the process types.
logger.add(new winston.transports.File({ filename: "combined.log" }))
if (process.env.PROCESS_TYPE) {
    // Adds the console logger, only if a process type is defined (productive mode)
    logger.add(new (winston.transports.Console)())
}

module.exports = logger