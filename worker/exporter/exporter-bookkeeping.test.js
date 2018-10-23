/* global beforeAll afterAll expect test */
const fs = require("fs")
const rimraf = require("rimraf")
const Exporter = require("./exporter")

const config = {
    "name": "localhost",
    "id": "1",
    "originators": ["localhost"],
    "topic": "transaction",
    "database-url": "book-db",
    "limit": 10,
    "interval": 500,
    "export-dir": "./export",
    "exported-store": "exported"
}

let exporter = undefined

beforeAll((done) => {

    fs.mkdir(config["database-url"], done)
})

afterAll((done) => {
    rimraf(config["database-url"], done)
})

test("Should create an exporter.", () => {
    exporter = new Exporter(config)
    expect(exporter).toBeDefined()
})

test("should fail, if the bookkepping database isn't initialized.", () => {
    exporter.bookkeepingStore = undefined
    exporter.start()
    expect(exporter.started).toBeFalsy()
})