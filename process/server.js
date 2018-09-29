const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const {
  paths,
  localServer
} = require(path.join(__dirname, '../config'))

// Express setup and extend
const app = express()
app.set('view engine', 'ejs') // view template engine use ejs
app.use(bodyParser.json()) // get post json params from req.body
const logger = require(path.join(paths.lib, 'logger')) // winston logger
app.use(morgan('common')) // morgan logger to stdio
app.use(morgan('common', { // morgan logger to file
  stream: fs.createWriteStream(path.join(paths.log, 'server.log'), {
    flags: 'a'
  })
}))

// Express Routes
app.post(localServer.webhookPath, (req, res) => { // danmu received
  body = {
    status: 'ok',
    message: 'danmu received',
    params: req.body
  }
  res.json(body)
  process.send(body)
})

// Express server up
app.listen(localServer.port, logger.info(`server@server up, listening port: ${localServer.port}`))

// Kill process
process.on('SIGTERM', () => {
  logger.info('server@SIGTERM')
  process.exit(0)
})
