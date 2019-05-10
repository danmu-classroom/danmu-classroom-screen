const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const { App } = require(path.join(__dirname, '../app.js'))

// Express setup and extend
const app = express()
app.set('view engine', 'ejs') // view template engine use ejs
app.use(bodyParser.json()) // get post json params from req.body
app.use(morgan('common')) // morgan logger to stdio
app.use(morgan('common', { // morgan logger to file
  stream: fs.createWriteStream(App.log.transports.file.findLogPath(), {
    flags: 'a'
  })
}))

// Express Routes
app.post(App.config.localhost.webhook, (req, res) => { // danmu received
  body = {
    status: 'ok',
    message: 'danmu received',
    params: req.body
  }
  res.json(body)
  process.send(body)
})

// Express server up
app.listen(App.config.localhost.port, App.log.info(`server@server up, listening port: ${App.config.localhost.port}`))

// Kill process
process.on('SIGTERM', () => {
  App.log.info('server@SIGTERM')
  process.exit(0)
})
