/* global expect fail test */
const calculateBookkeepingIds = require("./calculate-bookkeeping-ids")

test("Should throw an exception, if no configuration is provided.", () => {
    try {
        calculateBookkeepingIds()
        fail()
    }
    catch (error) { /* Works as intended. */ }
})

test("Should throw an exception, if not topic is provided.", () => {
    try {
        calculateBookkeepingIds({originators: []})
        fail()
    }
    catch (error) { /* Works as intended. */ }
})

test("Should provide an empty array, if the configuration has an topic and an originator in.", () => {
    expect(calculateBookkeepingIds({topic: "test", originators: []})).toEqual([])
    expect(calculateBookkeepingIds({topic: "test"})).toEqual([])
})

test("Should return an arrays of Ids, if more than one originator is provided.", () => {
    expect(calculateBookkeepingIds({topic: "test", originators: ["o1", "o2"]})).toEqual(["test-o1", "test-o2"])
})