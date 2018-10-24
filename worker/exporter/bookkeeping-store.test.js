/* global afterAll beforeAll expect fail test */
const BookkeepingStore = require("./bookkeeping-store")
const rimraf = require("rimraf")
const fs = require("fs")
const DbMock = require("../../tests/mocks/DbMock")

const config = {
    "database-url": "bs-db",
    "topic": "test",
    "id": 1,
    "originators": []
}

let store

beforeAll((done) => {
    fs.mkdir(config["database-url"], done)
})

afterAll((done) => {
    rimraf(config["database-url"], done)
})

test("should create a new bookkeeping store.", () => {
    store = new BookkeepingStore(config)
    expect(store).toBeDefined()
    expect(store.bookkeepingDb).toBeDefined()
})

test("should provide an empty list of bookkeeping Ids, as no originators are defined.", () => {
    store.originators = undefined
    expect(store.calculateBookkeepingIds()).toEqual([])
})

test("should fail to create a bookkeeping store, if one of the initialization parameters isn't provided.", () => {
    try {
        new BookkeepingStore()
        fail()
    }
    catch (error) { /* Works as expected */ }
})

test("Should create a promise.", (done) => {
    store.originators = ["orig"]
    const bookkeepingIds = store.calculateBookkeepingIds()
    expect(bookkeepingIds.length).toBe(1)
    store.getBookkeepingInfo(bookkeepingIds[0], store.originators[0])
        .then((doc) => {
            expect(doc["_id"]).toBe(bookkeepingIds[0])
            expect(doc["sequence-no"]).toBe(0)
            done()
        })
        .catch((error) => {
            fail(error)
            done()
        })
})

test("Should update the bookkeeping information.", (done) => {
    const bookkeepingIds = store.calculateBookkeepingIds()
    store.updateBookkeepingInfo(store.originators[0], 100).then(() => {
        store.getBookkeepingInfo(bookkeepingIds[0], store.originators[0])
            .then((doc) => {
                expect(doc["sequence-no"]).toBe(100)
                done()
            })
            .catch((error) => {
                fail(error)
                done()
            })
    })
})

test("should fail to update the bookkeeping information, if the originator is unkonwn.", (done) => {
    store.bookkeepingDb = new DbMock({"get-success": false, "put-success": false})
    store.updateBookkeepingInfo("Don't care!", 1).then(() => {
        fail()
        done()
    }).catch(() => {
        done()
    })
})

test("should check, that the bookkeeping database is really present.", (done) => {
    store.bookkeepingDb = new DbMock({"get-success": false, "put-success": false})
    store.initiateBookkeeping().then(() => {
        fail()
        done()
    }).catch(() => {
        done()
    })
})

test("should fail, if put is working, but get not.", (done) => {
    store.bookkeepingDb = new DbMock({"get-success": false, "put-success": true})
    store.initiateBookkeeping().then(() => {
        fail()
        done()
    }).catch(() => {
        done()
    })
})