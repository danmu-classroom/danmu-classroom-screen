const path = require('path')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const {
  libPath,
  logPath,
  port,
  webhookPath
} = require(path.join(__dirname, '../config'))


const app = express()

// view template engine use ejs
app.set('view engine', 'ejs')

// get post json params from req.body
app.use(bodyParser.json());

// logger
// winston
const logger = require(path.join(libPath, 'logger'))
// morgan to stdio
app.use(morgan('common'))
// morgan to file
fs.existsSync(logPath) || fs.mkdirSync(logPath)
app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(logPath, 'server.log'), {
    flags: 'a'
  })
}))

// routes
app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.post(webhookPath, (req, res) => {
  // danmu received
  body = {
    status: 'ok',
    message: 'danmu received',
    params: req.body
  }
  logger.info(`process@server@danmu-received ${JSON.stringify(req.body)}`)
  res.json(body)
  process.send(body)
})

// server up
app.listen(port, () => logger.info(`process@server@express-up port: ${port}`))

// kill process
process.on('SIGTERM', () => {
  logger.info('process@server@SIGTERM')
  process.exit(0)
});
