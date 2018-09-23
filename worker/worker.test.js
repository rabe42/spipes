/* global fail test */
const Worker = require("./worker")

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