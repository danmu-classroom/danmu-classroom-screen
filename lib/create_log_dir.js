const path = require('path')
const fs = require('fs')
const logPath = require(path.join(__dirname, '../config')).logPath

function createLogDir() {
  fs.existsSync(logPath) || fs.mkdirSync(logPath)
}

createLogDir()
