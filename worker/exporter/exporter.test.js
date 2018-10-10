/* global setImmediate afterAll beforeAll test expect fail */
const fs = require("fs")
const rimraf = require("rimraf")
const path = require("path")
const PouchDB = require("pouchdb")
const Exporter = require("./exporter")
const config = require("../../config/exporter")
const message1 = {
    _id: "transaction-localhost-1",
    "originator": "fqdn1.node.name",
    "destination": "fqdn1.node.name",
    "content-type": "mime-type",
    "topic": "transaction",
    "data": "First message data"
}
const message2 = {
    _id: "transaction-localhost-2",
    "originator": "fqdn2.node.name",
    "destination": "fqdn2.node.name",
    "content-type": "mime-type",
    "topic": "transaction",
    "data": "Second message data"
}
const message3 = {
    _id: "transaction-localhost-3",
    "originator": "fqdn3.node.name",
    "destination": "fqdn3.node.name",
    "content-type": "mime-type",
    "topic": "transaction",
    "data": "Third message data"
}
const message4 = {
    _id: "transaction-localhost-4",
    "originator": "fqdn3.node.name",
    "destination": "fqdn3.node.name",
    "content-type": "mime-type",
    "topic": "transaction",
    "data": "Third message data"
}
const message5 = {
    _id: "transaction-localhost-5",
    "originator": "fqdn3.node.name",
    "destination": "fqdn3.node.name",
    "content-type": "mime-type",
    "topic": "transaction",
    "data": "Third message data"
}

let exporter, 
    transactionDb,
    exportedDb

function mkdir(dirName) {
    try {
        fs.mkdirSync(dirName)
    }
    catch (err) { /* Ignored */ }
}

beforeAll((done) => {
    mkdir(config["database-url"])
    exportedDb = new PouchDB(`${config["database-url"]}/${config["exported-store"]}`)
    transactionDb = new PouchDB(`${config["database-url"]}/${config["topic"]}`)
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

afterAll((done) => {
    rimraf.sync(config["export-dir"])   // Deletes the exported files from the system.
    rimraf.sync(config["database-url"]) // Deletes all databases from the system.
    setImmediate(done)
})

test("should be possible to get all not exported docs from the database.", () => {
    exporter = new Exporter(config)
    exporter.start()
})

test("should have files in the export-dir.", (done) => {
    expect(fs.existsSync(config["export-dir"])).toBeTruthy()
    setTimeout(() => {
        const directory = fs.readdirSync(config["export-dir"])
        expect(directory.length).toBe(2) // Minimum "test-1", "test-2"
        done()
    }, config.interval * 2)
})

test("should find my content in the 'test-1' file.", () => {
    const fn = path.format({dir: config["export-dir"], base: message1._id})
    const fileContent = fs.readFileSync(fn)
    const json = JSON.parse(fileContent)
    expect(json.originator).toBe(message1.originator)
})

test("should have no elements in the topic store.", (done) => {
    transactionDb.allDocs().then((result) => {
        expect(result.rows.length).toBe(0)
        done()
    }).catch((error) => {
        fail(error)
        done()
    })
})

test("should have two elements in the exported queue", (done) => {
    exportedDb.allDocs().then((result) => {
        expect(result.rows.length).toBe(2)
        done()
    }).catch((error) => {
        fail(error)
        done()
    })
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

test("should export a file of the new 'received' message.", (done) => {
    setTimeout(() => {
        const fn = path.format({dir: config["export-dir"], base: message3._id})
        expect(fs.existsSync(fn)).toBeTruthy()
        done()
    }, config.interval + 100)
})

test("should put a message with a gap into the database.", (done) => {
    transactionDb.put(message5).then(() => {
        done()
    }).catch((err) => {
        fail(err)
        done()
    })
})

test("should not export this file, as there is a gap in the sequence.", (done) => {
    setTimeout(() => {
        const fn = path.format({dir: config["export-dir"], base: message5._id})
        expect(fs.existsSync(fn)).toBeFalsy()
        done()
    }, config.interval + 100)
})

test("should put a message which closes the gap into the database.", (done) => {
    transactionDb.put(message4).then(() => {
        done()
    }).catch((err) => {
        fail(err)
        done()
    })
})

test("should not export this file, as there is a gap in the sequence.", (done) => {
    setTimeout(() => {
        const fn4 = path.format({dir: config["export-dir"], base: message4._id})
        const fn5 = path.format({dir: config["export-dir"], base: message5._id})
        expect(fs.existsSync(fn4)).toBeTruthy()
        expect(fs.existsSync(fn5)).toBeTruthy()
        done()
    }, config.interval + 100)
})

test("should close the database.", (done) => {
    exporter.close().then(done)
})