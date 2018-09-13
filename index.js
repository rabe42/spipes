/* global process */

const processType = process.env.PROCESS_TYPE

if (processType === "receiver") {
    require("./server/receiver")
}
else if (processType === "executor") {
    require("./worker/executor")
}
else if (processType === "exporter") {
    require("./worker/exporter")
}
else {
    throw new Error(`'${processType}' is an unsupported process type!`)
}