/* global test expect fail */
const Server = require("./server")

class ListenerMock {

    listen() {
        this.listening = true
    }
}

test("Should throw an error, if no configuration is provided.", () => {
    try {
        new Server()
        fail()
    }
    catch (error) { /* Works as designed. */ }
})

test("Should create a server, if a configuration is provided.", () => {
    new Server({name: "server"})
})

test("Should throw an error, if the server isn't defined before start.", () => {
    try {
        const server = new Server({name: "server"})
        server.start()
    }
    catch (error) { /* Works as designed. */ }
})

test("Should be listening, if configuration and server provided on time.", () => {
    const server = new Server({name: "server"})
    server.server = new ListenerMock()
    server.start()
    expect(server.server.listening).toBeTruthy()
})