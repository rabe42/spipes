/* global test process */

/**
 * Checks, if the process type triggers the output to the console.
 */
process.env.PROCESS_TYPE = "test"
const logger = require("./logger")

test("log result should include the current time.", () => {
    logger.info("A message.")
})