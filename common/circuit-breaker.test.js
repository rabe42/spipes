/* global fail test */

const CircuitBreaker = require("./circuit-breaker")

test("should create a new circuit breaker.", () => {
    new CircuitBreaker(() => {})
})

test("should fail to validate the options.", () => {
    try {
        new CircuitBreaker(() => {}, {a: "b"})
        fail()
    }
    catch (error) { /* Works as expected. */ }
})

test("should succeed to validate the right opionts.", () => {
    new CircuitBreaker(() => {}, {
        maxFailures: 1,
        timeout: 20,
        resetTimeout: 100
    })
})