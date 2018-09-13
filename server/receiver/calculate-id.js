
/**
 * Calculates an id for the given data record. The idea of this Id is to have a unique sequence number for each message.
 * @param {*} data The data, for which we have to calculate the Id.
 */
function calculateId(data) {
    if (data === undefined) {
        throw new Error("Cannot calculate an id for non existing data.")
    }
    if (data.originator === undefined) {
        throw new Error("Originator missing!")
    }
    if (data["sequence-no"] === undefined) {
        throw new Error("Sequnce number missing!")
    }
    return `${data.topic}-${data.originator}-${data["sequence-no"]}`
}

module.exports = calculateId