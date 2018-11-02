/* global expect fail test */
const Promise = require("promise")
const CircuitBreaker = require("./circuit-breaker")

test("should create a new circuit breaker.", () => {
    new CircuitBreaker(() => {}, () => {})
})

test("should fail to validate the options.", () => {
    try {
        new CircuitBreaker(() => {}, () => {}, {a: "b"})
        fail()
    }
    catch (error) { /* Works as expected. */ }
})

test("should succeed to validate the right options.", () => {
    new CircuitBreaker(() => {}, () => {}, {
        name: "A test",
        maxFailures: 1,
        timeout: 20,
        resetTimeout: 100
    })
})

test("should work transparent on the happy path.", (done) => {
    let called = false
    const cb = new CircuitBreaker(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                called = true
                resolve(true)
            }, 100)
        })
    }, () => {})
    cb.service().then(() => {
        expect(called).toBeTruthy()
        done()
    }).catch((error) => {
        fail(error)
    })
})