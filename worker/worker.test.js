/* global fail test setImmediate */
const Worker = require("./worker")
const fs = require("fs")
const rimraf = require("rimraf")

test("should be possible to create a worker.", () => {
    new Worker({"limit": 100})
})

test("should not create an instance without configuration.", () => {
    try {
        new Worker()
        fail()
    }
    catch(error) { /* Works as designed. */ }
})

test("should not be possible to start, without redefining the start method.", () => {
    const worker = new Worker({"limit": 100})
    try {
        worker.start()
    }
    catch(error) { /* Works as designed. */ }
})

test("should be possible to close a not initialized worker.", (done) => {
    const worker = new Worker({"limit": 100})
    worker.close().then(done)
})

test("should create a testdb directory.", (done) => {
    fs.mkdirSync("./testdb")
    setImmediate(done)
})

test("should close a database, if created.", (done) => {
    const worker = new Worker({"limit": 100})
    worker.init("./testdb/test")
    worker.close().then(done)
})

test("should delete the testdb directory.", (done) => {
    rimraf.sync("./testdb")
    setImmediate(done)
})