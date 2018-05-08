const path = require('path')

const paths = {}
paths.root = path.join(__dirname)
paths.proc = path.join(paths.root, 'process')
paths.lib = path.join(paths.root, 'lib')
paths.views = path.join(paths.root, 'views')
paths.assets = path.join(paths.root, 'assets')
paths.log = path.join(paths.root, 'log')

const localServer = {}
localServer.port = 8080
localServer.webhookPath = '/webhook'

const danmuServer = 'https://danmu-classroom.herokuapp.com'
// const danmuServer = 'http://localhost:3000'

module.exports = {
  paths: paths,
  localServer: localServer,
  danmuServer: danmuServer
}
