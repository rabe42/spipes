/* global beforeAll afterAll expect test */
const Exporter = require("./exporter")
const fs = require("fs")
const rimraf = require("rimraf")
const config = require("../../config/exporter")

config["database-url"] = "config-db"
config["topic"] = "test"

beforeAll((done) => {
    fs.mkdir("config-db", done)
})

afterAll((done) => {
    rimraf("config-db", done)
})

test("Should provide an empty array, if the configuration has an topic and an originator in.", () => {
    config["originators"] = []
    const exporter = new Exporter(config)

    expect(exporter.calculateBookkeepingIds()).toEqual([])
    expect(exporter.calculateBookkeepingIds({topic: "test"})).toEqual([])
})

test("Should return an arrays of Ids, if more than one originator is provided.", () => {
    config["originators"] = ["o1", "o2"]
    const exporter = new Exporter(config)
    expect(exporter.calculateBookkeepingIds()).toEqual(["test-o1", "test-o2"])
})