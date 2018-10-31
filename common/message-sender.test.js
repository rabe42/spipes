/* global afterAll beforeAll fail test */
const fs = require("fs")
const rimraf = require("rimraf")

/**
 * Tests the sender class, which provides a simple way to send messages into
 * the infrastructure.
 */
const MessageSender = require("./message-sender")
const config = require("../config/sender")

beforeAll((done) => {
    fs.mkdir(config["database-url"], done)
})

afterAll((done) => {
    rimraf(config["database-url"], done)
})

let sender

test("Should be possible to create a message sender.", () => {
    sender = new MessageSender(config)
})

test("Should store the message and information into the queue database.", (done) => {
    sender.send("destination", "topic", {name: "payload"}).then(() => {
        done()
    }).catch((error) => {
        fail(error)
        done()
    })
})