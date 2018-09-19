/* global afterAll beforeAll test expect fail */
/**
 * This should test the e2e behaviour as far as possible. As the listen() call is blocking, we 
 * will concentrate on the database end of the service.
 */
const rimraf = require("rimraf")
const fs = require("fs")
const config = require("../config/receiver")
const Receiver = require("../server/receiver/receiver")
const streamMock = require("../server/receiver/http2-stream-mock")
const calculateId = require("../server/receiver/calculate-id")

const bodyObject = {
    "originator": "localhost",
    "destination": "server", 
    "sequence-no": 201, 
    "topic": "transaction", 
    "data": "My data"
}

let receiver = undefined

function mkdir(dirName) {
    try {
        fs.mkdirSync(dirName)
    }
    catch (err) { /* Ignored */ }
}

/**
 * Making sure, we're starting on a green field.
 */
beforeAll(() => {
    mkdir(config.databaseUrl)
    receiver = new Receiver(config)
})

/**
 * Making sure, that we don't influence other tests.
 */
afterAll((done) => {
    receiver.close().then(() => {
        rimraf.sync(config.databaseUrl)
        done()
    })
})

test("should store the document send in the body in the database.", (done) => {
    const headers = {
        ":method": "POST",
        ":path": "/"
    }
    const bodyString = JSON.stringify(bodyObject)
    receiver.handleRequest(streamMock, headers)
    streamMock.events["data"](bodyString)
    streamMock.events["end"]()
    setTimeout(done, 500) // As the saving will be done asynchronously, we should give it some time.
})

test("should have the item in the database!", (done) => {
    const db = receiver.getDb(bodyObject.topic)
    expect(db).toBeDefined()
    db.get(calculateId(bodyObject))
        .then((item) => {
            expect(item["sequence-no"]).toBe(201)
            done()
        })
        .catch((err) => {
            fail(err)
            done()
        })
})

test("should close the databases at the end.", (done) => {
    receiver.close().then(done)
})