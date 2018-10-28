/* global test */
/**
 * Tests the sender class, which provides a simple way to send messages into
 * the infrastructure.
 */
const MessageSender = require("./message-sender")
const config = require("../config/sender")

test("Should be possible to create a message sender.", () => {
    new MessageSender(config)
})