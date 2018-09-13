/* global test expect fail */
const calculateId = require("./calculate-id")

test("should throw an exception, if not all required properties are provided.", () => {
    try {
        calculateId()
        fail()
    }
    catch (e) { /* Works as expected! */ }
    try {
        calculateId({ "sequence-no": 0 })
        fail()
    }
    catch (e) { /* Works as expected! */ }
    try {
        calculateId({
            originator: "::1" // Missing sequence number
        })
        fail()
    }
    catch (e) { /* Works as expected! */ }
})

test("should create a unique Id out of the origenator and the sequence number provided.", () => {
    expect(calculateId({originator: "::1", "sequence-no": 0})).toBeDefined()
})