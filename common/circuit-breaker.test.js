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

test("should fail, if nothing is provided.", () => {
    try {
        new CircuitBreaker()
        fail()
    }
    catch (error) { /* Works as expected. */}
    try {
        new CircuitBreaker("A string", () => {})
        fail()
    }
    catch (error) { /* Works as expected. */ }
})

test("should fail, if the fallback function isn't provided.", () => {
    try {
        new CircuitBreaker(() => {})
        fail()
    }
    catch (error) { /* Works as expected. */ }
    try {
        new CircuitBreaker(() => {}, "a")
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

test("should provide the fallback result, if the number of failures exceed.", (done) => {
    let fallbackCalled = false
    const cb = new CircuitBreaker(
        () => {
            return new Promise((resolve, reject) => {
                reject()
            })}, 
        () => {
            fallbackCalled = true
            return "Ha ha!"
        }, 
        { name: "fallback test", maxFailures: 1 })
    cb.service().then(() => {
        fail("Unexpected success of the service function!")
        done()
    }).catch(() => {
        cb.service().then(() => {
            expect(fallbackCalled).toBeTruthy()
            done()
        }).catch((error) => {
            fail(error)
            done()
        })
    })
})

test("should retry, after the reset timeout is over.", (done) => {
    let serviceCalled = 0
    let fallbackCalled = 0
    const cb = new CircuitBreaker(
        () => {
            return new Promise((resolve, reject) => {
                serviceCalled++
                reject()
            })}, 
        () => {
            fallbackCalled++
            return "Ha ha!"
        }, 
        { name: "fallback test", maxFailures: 1, resetTimeout: 10 })
    cb.service().catch(() => {
        expect(serviceCalled).toBe(1)
        cb.service().then(() => {
            expect(fallbackCalled).toBe(1)
            setTimeout(() => {
                cb.service().catch(() => {
                    expect(serviceCalled).toBe(2)
                    expect(fallbackCalled).toBe(1)
                    done()
                })
            }, 50)
        }).catch((error) => {
            fail(error)
            done()
        })
    })
})

test("should be back to normal calling it the 2nd time.", (done) => {
    let serviceCalled = 0
    let fallbackCalled = 0
    const cb = new CircuitBreaker(
        () => {
            return new Promise((resolve, reject) => {
                serviceCalled++
                if (serviceCalled === 1) {
                    reject()
                }
                else {
                    resolve()
                }
            })}, 
        () => {
            fallbackCalled++
            return "Ha ha!"
        }, 
        { name: "fallback test", maxFailures: 1, resetTimeout: 10 })
    cb.service().catch(() => {
        expect(serviceCalled).toBe(1)
        cb.service().then(() => {
            expect(fallbackCalled).toBe(1)
            setTimeout(() => {
                cb.service().then(() => {
                    expect(serviceCalled).toBe(2)
                    expect(fallbackCalled).toBe(1)
                    done()
                }).catch((error) => {
                    fail(error)
                    done()
                })
            }, 50)
        }).catch((error) => {
            fail(error)
            done()
        })
    })
})