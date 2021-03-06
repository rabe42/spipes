/* global setImmediate */
const Promise = require("promise")

class DbMock {
    constructor(config) {
        this.config = config
        this.doneFctn = config["done"]
    }
    /**
     * The mocked method can be controlled by the consturctor parameters. It will
     * ignore all parameters provided on the call.
     */
    get() {
        let that = this
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                if (that.config["get-success"]) {
                    resolve(that.config["result"])
                }
                else {
                    reject(new Error("Earth is blue..."))
                }
                if (that.doneFctn) {
                    that.doneFctn()
                }
            })
        })
    }
    /**
     * The mocked put() method can be controlled by the constructor parameters. It
     * will ignore all parameters, provided on the call.
     */
    put() {
        let that = this
        return new Promise(function(resolve, reject) {
            setImmediate(() => {
                if (that.config["put-success"]) {
                    resolve(that.config["result"])
                }
                else {
                    reject(new Error("Huston..."))
                }
                if (that.doneFctn) {
                    that.doneFctn()
                }
            })
        })
    }
    /**
     * Allways succeed in closing the database.
     */
    close() {
        return new Promise((resolve) => {
            resolve()
        })
    }
}

module.exports = DbMock