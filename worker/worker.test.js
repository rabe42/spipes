/* global fail test expect setImmediate */
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

test("should not be able to initialize the worker, if the database don't exists.", () => {
    const worker = new Worker({"limit": 100})
    try {
        worker.init("./testdb", "topic")
        fail()
    }
    catch (error) { /* Works as expected. */ }
})

test("should create a testdb directory.", (done) => {
    fs.mkdir("./testdb", done)
})

test("dir should exists!", () => {
    fs.existsSync("./testdb")
})

test("should close a database, if created.", (done) => {
    const worker = new Worker({"limit": 100})
    worker.init("./testdb", "topic")
    worker.close().then(done)
})

test("should delete the testdb directory.", (done) => {
    rimraf.sync("./testdb")
    setImmediate(done)
})

test("should check if the database URL is remote.", () => {
    const worker = new Worker({"limit": 100})
    expect(worker.isRemoteDatabase("http://localhost")).toBeTruthy()
    expect(worker.isRemoteDatabase("https://localhost")).toBeTruthy()
    expect(worker.isRemoteDatabase("db")).toBeFalsy()
})

test("should check the folder exists.", () => {
    const worker = new Worker({"limit": 100})
    try {
        worker.checkLocationExists("blah")
        fail()
    }
    catch (error) { /* Works as expected. */ }
})

test("should just setup the connection to the remote database.", () => {
    const worker = new Worker({"limit": 100})
    worker.init("https://localhost:5984")
})

test("should create a message id.", () => {
    const worker = new Worker({"topic": "topic"})
    expect(worker.calculateMessageId("here", 0)).toBe("topic-here-0")
})

test("should throw an exception, if the sequence number is ommited.", () => {
    const worker = new Worker({"topic": "topic"})
    try {
        worker.calculateMessageId("here")
        fail()
    }
    catch (error) { /* Works as expected! */}
})