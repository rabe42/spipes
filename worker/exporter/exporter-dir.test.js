/* global afterAll beforeAll fail test */
const Exporter = require("./exporter")
const config = require("../../config/exporter")
const fs = require("fs")
const path = require("path")
const rimraf = require("rimraf")

const logger = require("../../common/logger")

config["database-url"] = "exp-test-db"
config["export-dir"] = "exp-test-dir"

beforeAll(() => {
    fs.mkdirSync(config["database-url"])
    fs.mkdirSync(path.format({dir: config["database-url"], base: "messages"}))
})

afterAll((done) => {
    rimraf(config["database-url"], done)
})

test("should throw an exception, if the file isn't available. export a file.", (done) => {
    logger.debug("test: should throw an exception, if the file isn't available. export a file.")
    const exporter = new Exporter(config)
    exporter.exportMessage({"a": "A", "b": "B"}).then(() => {
        fail()
        done()
    }).catch(() => { 
        /* Works as exprected */
        done()
    })
})

test("create the export directory", (done) => {
    logger.debug("test: create the export directory")
    fs.mkdir(config["export-dir"], done)
})

test("should be able to successful export a message.", (done) => {
    logger.debug("test: should be able to successful")
    const exporter = new Exporter(config)
    exporter.exportMessage({_id: "test-Id", "a": "A", "b": "B"}).then(() => {
        done()
    }).catch((error) => { 
        fail(error)
        done()
    })
})

test("should not export a message without an _id atribute.", (done) => {
    logger.debug("test: should not export a message without an _id atribute.")
    const exporter = new Exporter(config)
    exporter.exportMessage({"a": "A", "b": "B"}).then(() => {
        fail()
        done()
    }).catch(() => { 
        done()
    })
})

test("delete the export directory", (done) => {
    logger.debug("test: delete the export directory")
    rimraf(config["export-dir"], done)
})