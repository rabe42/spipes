/* global test expect fail */
const Exporter = require("./exporter")
const config = require("../../config/exporter")

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