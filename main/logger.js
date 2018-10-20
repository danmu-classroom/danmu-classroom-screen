const path = require('path')
const fs = require('fs')
const winston = require('winston')
const folder = require(path.join(__dirname, '../config')).folder
const filename = require(path.join(__dirname, '../config')).filename

// setup log directory
function setupLogDir() {
  fs.existsSync(folder.log) || fs.mkdirSync(folder.log)
}
setupLogDir()

module.exports = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: path.join(folder.log, filename.appLog)
    })
  ]
})
