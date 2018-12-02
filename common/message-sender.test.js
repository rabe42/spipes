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