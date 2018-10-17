const process = require("process")
const fs = require("fs")
const path = require("path")

/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Checks if the licenses, used in this project are all known and confirmed.
 * @author Dr.-Ing. Ralf Berger (c) 2018
 */

// SPDX-License-Identifier!
const confirmedLicenses = ["MIT", "ISC", "BSD", "BSD-3-Clause", "BSD-2-Clause", "Apache-2.0"]

// Packages which were already checked manually and don't to have checked at all.
const manuallyCheckedPackages = [".bin", "amdefine", "argsarray", "atob"]

/**
 * Checks, if the provided package name is part of the manuallyCheckedPackages. If this
 * is the case, no check is needed.
 * 
 * @returns true, if the license check is needed.
 */
function isCheckNeeded(packageFileName) {
    return !manuallyCheckedPackages.includes(packageFileName)
}

/**
 * @returns true, if the license attribute of the provided data is in the array with 
 * the valid licenses.
 */
function checkLicense(data) {
    let result = {}
    if (!data) {
        result.error = "No data in package.json!"
    }
    else if (!data["license"]) {
        result.error = "No license property in package.json"
    }
    else {
        result.license = data["license"]
        result.success = confirmedLicenses.includes(data["license"])
        if (!result.success) {
            result.error = "Not in valid licenses."
        }
    }
    return result
}

// Read the node_modules directory.
fs.readdir(path.join("node_modules"), (error, files) => {
    if (error) {
        console.error(`Cannot read directory due to: ${error}`)
        process.exit(1)
    }
    // Read the package.json file in this directory.
    for (let i = 0; i < files.length; i++) {
        if (isCheckNeeded(files[i])) {
            let packageFileName = path.join("node_modules", files[i], "package.json")
            // console.info(packageFileName)
            fs.readFile(packageFileName, (error, data) => {
                if (error) {
                    console.error(`Cannot read the "package.json" of ${files[i]} due to: ${error}`)
                }
                else {
                    // Check, if the mentioned license is in the confirmed license list.
                    const check = checkLicense(JSON.parse(data))
                    if (!check.success) {
                        console.error(`The package "${files[i]}" comes not with an valid license "${check.license}", but has the following issue: ${check.error}`)
                    }
                }
            })
        }
    }
})
