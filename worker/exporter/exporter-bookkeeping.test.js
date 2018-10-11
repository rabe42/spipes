/* global beforeAll afterAll expect fail test */
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
    expect(exporter.bookkeepingDb).toBeDefined()
})

test("Should create a promise.", (done) => {
    const bookkeepingIds = exporter.calculateBookkeepingIds()
    expect(bookkeepingIds.length).toBe(1)
    exporter.getBookkeepingInfo(bookkeepingIds[0], config["originators"][0])
        .then((doc) => {
            expect(doc["_id"]).toBe(bookkeepingIds[0])
            expect(doc["sequence-no"]).toBe(0)
            done()
        })
        .catch((error) => {
            fail(error)
            done()
        })
})

test("Should update the bookkeeping information.", (done) => {
    const bookkeepingIds = exporter.calculateBookkeepingIds()
    exporter.updateBookkeepingInfo(config["originators"][0], 100).then(() => {
        exporter.getBookkeepingInfo(bookkeepingIds[0], config["originators"][0])
            .then((doc) => {
                expect(doc["sequence-no"]).toBe(100)
                done()
            })
            .catch((error) => {
                fail(error)
                done()
            })
    })
})