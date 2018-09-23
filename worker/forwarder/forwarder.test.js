/* global fail test */
const Forwarder = require("./forwarder")
const config = require("../../config/forwarder")

test("Should create a forwarder instance.", () => {
    new Forwarder(config)
})

test("Should not create a forwarder without a valid configuration.", () => {
    try {
        new Forwarder({"topic": 1})
        fail()
    }
    catch (error) { /* Works as expected. */ }
})

test("Starting the forwarder should be possible.", () => {
    const forwarder = new Forwarder(config)
    forwarder.start()
})