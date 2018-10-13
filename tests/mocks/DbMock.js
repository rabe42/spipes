/* global setImmediate */
const Promise = require("promise")

class DbMock {
    constructor(isSuccess, doneFctn) {
        this.isSuccess = isSuccess
        this.doneFctn = doneFctn
    }
    get() {
        return this.put()
    }
    put() {
        let that = this
        this.thePromise = new Promise(function(resolve, reject) {
            setImmediate(function() {
                if (that.isSuccess) {
                    resolve()
                }
                else {
                    reject(new Error("Huston..."))
                }
                that.doneFctn()
            })
        })
        return this.thePromise
    }
    close() {
        return new Promise((resolve) => {
            resolve()
        })
    }
}

module.exports = DbMock