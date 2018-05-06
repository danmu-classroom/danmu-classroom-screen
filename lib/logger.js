const path = require('path')
const winston = require('winston')
const {
  libPath,
  logPath
} = require(path.join(__dirname, '../config'))

// setup log directory
require(path.join(libPath, 'create_log_dir'))

// setup logger
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: path.join(logPath, 'danmu-error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logPath, 'danmu.log')
    })
  ]
})

// common js module export
module.exports = logger;
