/* global afterAll beforeAll fail test */
const Forwarder = require("./forwarder")
const config = require("../../config/forwarder")
const fs = require("fs")
const rimraf = require("rimraf")
const path = require("path")

beforeAll(() => {
    fs.mkdirSync(config["database-url"])
    fs.mkdirSync(path.format({dir: config["database-url"], base: "messages"}))
})

afterAll((done) => {
    rimraf(config["database-url"], done)
})

test("Should create a forwarder instance.", () => {
    new Forwarder(config)
})

test("Should not create a forwarder without a valid configuration.", () => {
    try {
        new Forwarder({"topic": 1})
        fail()
    }
    catch (error) { /* Works as expected. */ }
})

let forwarder = undefined
test("Starting the forwarder should be possible.", (done) => {
    forwarder = new Forwarder(config)
    forwarder.start()
    setTimeout(done, 1500) // This is needed to make sure, that file operations can happen in the meantime.
})

test("should close the forwarder.", (done) => {
    forwarder.close().then(done).catch((err) => {
        fail(err)
        done()
    })
})
