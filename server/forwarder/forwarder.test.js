/* global test */
const Forwarder = require("./forwarder")
const config = require("../../config/forwarder")

test("Should create a forwarder instance.", () => {
    new Forwarder(config)
})