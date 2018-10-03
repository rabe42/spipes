/**
 * Calculates the ids of the bookkeeping store.
 * @param {*} config The configuration object with minimum a "topic" and an "originators" array.
 * @return An array with the ids of the bookkeeping store.
 */
function calculateBookkeepingIds(config) {
    let result = []
    if (!config) {
        throw new Error("A configuration must be provided.")
    }
    if (!config.topic) {
        throw new Error("A topic must be provided in the configuration.")
    }
    if (config.originators) {
        for (let i = 0; i < config.originators.length; i++) {
            result.push(`${config.topic}-${config.originators[i]}`)
        }
    }
    return result
}

module.exports = calculateBookkeepingIds