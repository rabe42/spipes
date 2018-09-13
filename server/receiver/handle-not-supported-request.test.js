/* global test expect */
const config = require("../../config/receiver")
const Receiver = require("./receiver")
let receiver = new Receiver(config)
const streamMock = require("./http2-stream-mock")

test("should reply a 503.", () => {
    receiver.handleNotSupportedRequest("method", "path", streamMock)
    expect(streamMock.header[":status"]).toBe(503)
})