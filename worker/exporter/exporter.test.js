/* global afterAll beforeAll test expect fail */
const fs = require("fs")
const rimraf = require("rimraf")
const path = require("path")
const PouchDB = require("pouchdb")
const Exporter = require("./exporter")
const config = require("../../config/exporter")
const message1 = {
    _id: "test-1",
    "originator": "fqdn1.node.name",
    "destination": "fqdn1.node.name",
    "content-type": "mime-type",
    "topic": "transaction",
    "data": "First message data"
}
const message2 = {
    _id: "test-2",
    "originator": "fqdn2.node.name",
    "destination": "fqdn2.node.name",
    "content-type": "mime-type",
    "topic": "transaction",
    "data": "Second message data"
}
const message3 = {
    _id: "test-3",
    "originator": "fqdn3.node.name",
    "destination": "fqdn3.node.name",
    "content-type": "mime-type",
    "topic": "transaction",
    "data": "Third message data"
}

let transactionDb = undefined

function mkdir(dirName) {
    try {
        fs.mkdirSync(dirName)
    }
    catch (err) { /* Ignored */ }
}

beforeAll((done) => {
    rimraf.sync(config.databaseUrl)
    mkdir(config.databaseUrl)
    transactionDb = new PouchDB("db/transaction")
    transactionDb.bulkDocs([message1, message2])
        .then(() => {
            rimraf.sync(config["export-dir"])
            done()
        })
        .catch((error) => {
            fail(error)
            done()
        })
})

afterAll(() => {
    rimraf.sync(config["export-dir"])
    rimraf.sync(config.databaseUrl)
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
    }, config.interval + 100)
})

test("should find my content in the 'test-1' file.", () => {
    const fn = path.format({dir: config["export-dir"], base: message1._id})
    const fileContent = fs.readFileSync(fn)
    const json = JSON.parse(fileContent)
    expect(json.originator).toBe(message1.originator)
})

test("should put a new message into the database.", (done) => {
    transactionDb.put(message3)
        .then(() => {
            done()
        })
        .catch((err) => {
            fail(err)
            done()
        })
})

test("should export a file of a new 'received' message.", (done) => {
    setTimeout(() => {
        const fn = path.format({dir: config["export-dir"], base: message3._id})
        expect(fs.existsSync(fn)).toBeTruthy()
        done()
    }, config.interval + 100)
})
