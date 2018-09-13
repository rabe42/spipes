/* global test */
import { fail } from "assert"

const validateParameters = require("./validate-parameters")
const config = require("../../config/receiver")

test("should fail, if not all required parameters are present.", () => {
    try {
        validateParameters({})
        fail()
    }
    catch (e) {
        /* works as expected. */ 
    }
})

test("shouldn't fail, if all required parameters are present and have the right value.", () => {
    validateParameters({
        originator: "::1",
        destination: "rabe42.com",
        "sequence-no": 0,
        "content-type": "text/plain",
        topic: "transaction",
        data: "This is the end!"
    }, config)
})

test("should fail, if all required parameters are present, but the topic is wrong.", () => {
    try {
        validateParameters({
            originator: "::1",
            destination: "rabe42.com",
            "sequence-no": 0,
            "content-type": "text/plain",
            topic: "noExistend",
            data: "This is the end!"
        }, config)
        fail()
    }
    catch (e) { /* Works as expected. */ }
})