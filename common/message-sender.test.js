/* global afterAll beforeAll expect fail test */
const PouchDB = require("pouchdb")
const fs = require("fs")
const rimraf = require("rimraf")

/**
 * Tests the sender class, which provides a simple way to send messages into
 * the infrastructure.
 */
const MessageSender = require("./message-sender")
const config = require("../config/sender")
const location = config["database-url"] + "/messages/" + config.topic

beforeAll(() => {
    fs.mkdirSync(config["database-url"])
    fs.mkdirSync(config["database-url"] + "/messages/")
    fs.mkdirSync(location)
})

afterAll((done) => {
    rimraf(config["database-url"], done)
})

let sender

test("Should fail to create a message sender with invalid configuration.", () => {
    try {
        new MessageSender({})
        fail()
    }
    catch (error) { /* Works as expected! */ }
})

test("Should fail to send, if the bookkeeping cannot be made.", (done) => {
    let nbConfig = {}
    Object.assign(nbConfig, config)
    nbConfig["bookkeeping-url"] = "/"       // It shouldn't be allowed to write to the root for the average developer!
    let nbSender = new MessageSender(nbConfig)
    nbSender.send("failedBookkeeping", {name: "payload"}).then(() => {
        fail("Unexpected success in sending message. Developer is allowed to write to root!")
        done()
    }).catch(() => {
        done()
    })
})

test("Should be possible to create a message sender.", () => {
    sender = new MessageSender(config)
    expect(sender).toBeDefined()
})

test("Should calculate the message database location as expected.", () => {
    expect(sender._calculateMessageDbLocation()).toBe(location)
})

test("Should store the message and information into the queue database.", (done) => {
    sender.send("topic", {name: "payload"}).then((result) => {
        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
        done()
    }).catch((error) => {
        fail(error)
        done()
    })
})

test("The message should be stored completely in the database.", (done) => {
    const dbURL = location
    const db = new PouchDB(dbURL)
    db.allDocs().then((result) => {
        expect(result.rows.length).toBe(1)
        done()
    }).catch((error) => {
        fail(error)
        done()    
    })
})

test("Should schedule more than one message for sending.", (done) => {
    sender.send("topic", {name: "p2", description: "The second message"}).then((result) => {
        expect(result.id).toBeDefined()
        return sender.send("topic", {name: "p3", description: "The third message"}).then((result) => {
            expect(result.id).toBeDefined()
            return sender.send("topic", {name: "p4", description: "The fourth message"}).then((result) => {
                expect(result.id).toBeDefined()
                done()
            })
        })
    }).catch((error) => {
        fail(error)
        done()
    })
})