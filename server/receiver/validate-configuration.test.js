import { fail } from "assert"

/* global test */
const validateConfiguration = require("./validate-configuration")

test("Empty configuration shouldn't work", () => {
    try {
        validateConfiguration()
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Non JSON shouldn't work.", () => {
    try {
        validateConfiguration(1)
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Empty JSON shouldn't work.", () => {
    try {
        validateConfiguration({})
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Name must be provided as string value.", () => {
    try {
        validateConfiguration({name: 1})
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Port must be provided as number.", () => {
    try {
        validateConfiguration({name: "test", port: "1"})
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Key location must be provided as a valid hostname.", () => {
    try {
        validateConfiguration({name: "test", port: 1, "key-location": 1})
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Certificate location must be provided as a string.", () => {
    try {
        validateConfiguration({name: "test", port: 1, "key-location": "1", "cert-location": 1})
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Accepted Topics should be an array.", () => {
    try {
        validateConfiguration({name: "test", port: 1, "key-location": "1", "cert-location": "1", "accepted-topics": 1})
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Database must be provided as a string.", () => {
    try {
        validateConfiguration({name: "test", port: 1, "key-location": "1", "cert-location": "1", "accepted-topics": [], "database-url": 1})
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Max document size must be provided as a number.", () => {
    try {
        validateConfiguration({name: "test", port: 1, "key-location": "1", "cert-location": "1", "accepted-topics": [], "database-url": "1", maxDocumentSizeBytes: "1"})
        fail()
    }
    catch (e) { /* Works as intended! */ }
})

test("Providing all configuration attributes with the correct types should work.", () => {
    validateConfiguration({
        "name": "test", 
        "port": 1, 
        "key-location": ".....1.1", 
        "cert-location": ".1.1", 
        "accepted-topics": [{name: "T1", hosts: ["::1"]}], 
        "database-url": "db://a/b/c1", 
        "max-hops": 10,
        "maxDocumentSizeBytes": 1
    })
})