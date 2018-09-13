/* global test expect */
const streamMock = require("./http2-stream-mock")
const Receiver = require("./receiver")
const config = require("../../config/receiver")
const receiver = new Receiver(config)

test("should answer with an 503 for a malformed request.", () => {
    receiver.handleRequest(streamMock, {})
    expect(streamMock.header[":status"]).toBe(503)
})

test("should answer with an 200, if it is a correct status request.", () => {
    receiver.handleRequest(streamMock, {":method": "GET", ":path": "/status"})
    expect(streamMock.header[":status"]).toBe(200)
})

test("should answer with an 200, if it is a correct post request with a valid topic.", () => {
    receiver.handleRequest(streamMock, {":method": "POST", ":path": "/"})
    expect(streamMock.header[":status"]).toBe(200)
})