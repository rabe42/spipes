/* global afterAll test expect setImmediate */

const config = require("../../config/receiver")
const Receiver = require("./receiver")
const streamMock = require("./http2-stream-mock")
const Promise = require("promise")

const correctDoc = {
    originator: "::1",
    destination: "rabe42.com",
    "sequence-no": 1,
    "content-type": "text/plain",
    topic: "transaction",
    data: "This is the end!"
}

class DBMock {
    constructor(isSuccess, doneFctn) {
        this.isSuccess = isSuccess
        this.doneFctn = doneFctn
    }
    put() {
        let that = this
        this.thePromise = new Promise(function(resolve, reject) {
            setImmediate(function() {
                if (that.isSuccess) {
                    resolve()
                }
                else {
                    reject(new Error("Huston..."))
                }
                that.doneFctn()
            })
        })
        return this.thePromise
    }
}

let receiver = new Receiver(config)

test("Should throw exception, if no stream is provided.", () => {
    receiver.handlePostRequest("", streamMock)
    expect(streamMock.header[":status"]).toBe(503)
})

test("Should complain, if it receives not a configured topic.", () => {
    receiver.handlePostRequest("/notExistingTopic", streamMock)
    expect(streamMock.header[":status"]).toBe(503)
})

test("Should return 503, if the topic is wrong.", () => {
    receiver.handlePostRequest("/", streamMock)
    streamMock.events["data"](JSON.stringify({
        originator: "::1",
        destination: "rabe42.com",
        "content-type": "text/plain",
        topic: "not existend",
        data: "This is the end!"
    }))
    streamMock.events["end"]()
    expect(streamMock.header[":status"]).toBe(503)
})

test("Shour return 503, if the data is not a JSON.", () => {
    receiver.handlePostRequest("/", streamMock)
    streamMock.events["data"]("An unexpected String!")
    streamMock.events["end"]()
    expect(streamMock.header[":status"]).toBe(503)
})

test("Request successful storage (together with the next test).", (done) => {
    const dbMock = new DBMock(true, done)
    receiver.databases[config.acceptedTopics[0].name] = dbMock

    receiver.handlePostRequest("/", streamMock)
    streamMock.events["data"](JSON.stringify(correctDoc))
    streamMock.events["end"]()
})

test("The former test should result in a 200 answer.", () => {
    expect(streamMock.header[":status"]).toBe(200)
})

test("Request successful storage (together with the next test).", (done) => {
    const dbMock = new DBMock(false, done)
    receiver.databases[config.acceptedTopics[0].name] = dbMock

    receiver.handlePostRequest("/", streamMock)
    streamMock.events["data"](JSON.stringify(correctDoc))
    streamMock.events["end"]()
})

test("The former test should result in a 503.", () => {
    expect(streamMock.header[":status"]).toBe(503)
})

afterAll((done) => {
    receiver.close().then(done)
})