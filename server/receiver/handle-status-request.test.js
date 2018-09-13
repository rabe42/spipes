/* global test fail expect */

/**
 * Checks, if the status request is handled as expected.
 */
const config = require("../../config/receiver")
const Receiver = require("./receiver")
let receiver = new Receiver(config)
let streamMock = require("./http2-stream-mock")

test("If no stream is provided, an exception should be thrown.", () => {
    try {
        receiver.handleStatusRequest("/status")
        fail()
    }
    catch (e) { /* Expected exception! */ }
})

test("If no path is given, a error should be issued.", () => {
    receiver.handleStatusRequest("/", streamMock)
    expect(streamMock.header[":status"]).toBe(401)
})

test("If correct path provided, a sucess should be provided.", () => {
    receiver.handleStatusRequest("/status", streamMock)
    expect(streamMock.header[":status"]).toBe(200)
})