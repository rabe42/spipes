/* global test expect */
const Receiver = require("./receiver")
const config = require("../../config/receiver")

test("should be initialized with the standard configuration.", () => {
    const receiver = new Receiver(config)
    expect(receiver).toBeDefined()
    expect(receiver.server).toBeDefined()
})

test("should create a database for a new topic.", (done) => {
    const receiverWithDb = new Receiver(config)
    expect(receiverWithDb.databases["a-topic"]).toBeUndefined()
    const newDb = receiverWithDb.getDb("a-topic")
    expect(newDb).toBeDefined()
    expect(receiverWithDb.databases["a-topic"]).toBe(newDb)
    expect(receiverWithDb.getDb("a-topic")).toBe(newDb)
    receiverWithDb.close()
        .then(() => { 
            done()
        })
})
