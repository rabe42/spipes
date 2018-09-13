/**
 * The stream mock class for testing purposes only. It allows to check
 * in the test functions, if the right information is provided via the
 * stream and also allows to control the callbacks, as they should be called
 * in the http2 nodejs framework.
 */
class Http2StreamMock {
    constructor() {
        this.events = {}
    }

    respond(header) {
        this.header = header
    }

    end(respondString) {
        this.respondString = respondString
    }

    on(event, fctn) {
        this.events[event] = fctn
    }
}

const streamMock = new Http2StreamMock()

module.exports = streamMock