/* global beforeAll test expect fail */
const fs = require("fs")
const PouchDB = require("pouchdb")
const Exporter = require("./exporter")
const config = require("../../config/exporter")

beforeAll((done) => {
    const transactionDb = new PouchDB("db/transaction")
    transactionDb.bulkDocs([
        {
            _id: "test-1",
            "originator": "fqdn.node.name",
            "destination": "fqdn.node.name",
            "content-type": "mime-type",
            "topic": "transaction",
            "data": "First message data"
        },
        {
            _id: "test-2",
            "originator": "fqdn.node.name",
            "destination": "fqdn.node.name",
            "content-type": "mime-type",
            "topic": "transaction",
            "data": "Second message data"
        }
    ])
        .then(() => {
            done()
        })
        .catch((error) => {
            fail(error)
            done()
        })
})

test("should throw an error, if the configuration isn't provided.", () => {
    try {
        new Exporter()
        fail()
    }
    catch (error) { /* Works as designed. */ }
})

test("should accept only valid configuration.", () => {
    const falseConfig = {
        "name": "a name",
        "databaseUrl": "db",
        "export-dir": "./export"    
    }
    try {
        new Exporter(falseConfig)
        fail()
    }
    catch (error) { /* Works as designed */ }
})

test("should be possible to create an exporter instance.", () => {
    const exporter = new Exporter(config)
    expect(exporter).toBeDefined()
})

test("should be possible to get all not exported docs from the database.", () => {
    const exporter = new Exporter(config)
    exporter.start()
})

test("should have files in the export-dir.", (done) => {
    expect(fs.existsSync(config["export-dir"])).toBeTruthy()
    setTimeout(() => {
        const directory = fs.readdirSync(config["export-dir"])
        expect(directory.length >= 2).toBeTruthy() // Minimum "test-1", "test-2"
        done()
    }, 500)
})

// exported files should have the expected content

// should export also new entries