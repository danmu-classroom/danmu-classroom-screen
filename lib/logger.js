const path = require('path')
const fs = require('fs')
const winston = require('winston')
const paths = require(path.join(__dirname, '../config')).paths

// setup log directory
function setupLogDir() {
  fs.existsSync(paths.log) || fs.mkdirSync(paths.log)
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
      filename: path.join(paths.log, 'danmu-error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(paths.log, 'danmu.log')
    })
  ]
})
