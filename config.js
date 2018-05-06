const path = require('path')

const rootPath = path.join(__dirname)
const processPath = path.join(rootPath, 'process')
const libPath = path.join(rootPath, 'lib')
const viewsPath = path.join(rootPath, 'views')
const assetsPath = path.join(rootPath, 'assets')
const logPath = path.join(rootPath, 'log')

const port = 8080
const danmuServerUrl = 'https://danmu-classroom.herokuapp.com'
// const danmuServerUrl = 'http://localhost:3000'
const webhookPath = '/webhook'

module.exports = {
  rootPath: rootPath,
  processPath: processPath,
  libPath: libPath,
  viewsPath: viewsPath,
  assetsPath: assetsPath,
  logPath: logPath,
  port: port,
  danmuServerUrl: danmuServerUrl,
  webhookPath: webhookPath
}
