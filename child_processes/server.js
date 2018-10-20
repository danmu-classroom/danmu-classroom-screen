const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const {
  folder,
  server,
  filename
} = require(path.join(__dirname, '../config'))

// Express setup and extend
const app = express()
app.set('view engine', 'ejs') // view template engine use ejs
app.use(bodyParser.json()) // get post json params from req.body
const logger = require(path.join(folder.main, 'logger')) // winston logger
app.use(morgan('common')) // morgan logger to stdio
app.use(morgan('common', { // morgan logger to file
  stream: fs.createWriteStream(path.join(folder.log, filename.serverLog), {
    flags: 'a'
  })
}))

// Express Routes
app.post(server.local.webhook, (req, res) => { // danmu received
  body = {
    status: 'ok',
    message: 'danmu received',
    params: req.body
  }
  res.json(body)
  process.send(body)
})

// Express server up
app.listen(server.local.port, logger.info(`server@server up, listening port: ${server.local.port}`))

// Kill process
process.on('SIGTERM', () => {
  logger.info('server@SIGTERM')
  process.exit(0)
})
