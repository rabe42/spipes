/* global afterAll beforeAll expect fail test */
const fs = require("fs")
const path = require("path")
const rimraf = require("rimraf")
const config = require("../../config/exporter")
const Exporter = require("./exporter")

beforeAll(() => {
    config["database-url"] = "db-config-test"
    fs.mkdirSync(config["database-url"])
    fs.mkdirSync(path.format({dir: config["database-url"], base: "messages"}))
})

afterAll((done) => {
    rimraf(config["database-url"], done)
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
        "database-url": "db-nonexist",
        "export-dir": "./export"    
    }
    try {
        new Exporter(falseConfig)
        fail()
    }
    catch (error) { /* Works as designed */ }
})

test("should be possible to create an exporter instance.", (done) => {
    const exporter = new Exporter(config)
    expect(exporter).toBeDefined()
    exporter.close().then(done)
})