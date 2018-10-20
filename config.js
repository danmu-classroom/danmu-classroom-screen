const path = require('path')

const folder = {}
folder.root = path.join(__dirname)
folder.main = path.join(folder.root, 'main')
folder.renderers = path.join(folder.root, 'renderers')
folder.childProcesses = path.join(folder.root, 'child_processes')
folder.public = path.join(folder.root, 'public')
folder.log = path.join(folder.root, 'log')

const filename = {
  appLog: 'app.log',
  serverLog: 'server.log'
}

const server = {
  local: {
    port: 8080,
    webhook: '/webhook'
  },
  danmu: 'https://danmu-classroom.herokuapp.com' // 'http://localhost:3000'
}

const danmu = {
  default: {
    speed: 5000, // ms
    fontFamily: '思源柔黑體',
    fontSize: 100, // px
    color: '#fff',
    strokeColor: '#000',
    strokeWidth: 3, // px
  }
}

module.exports = {
  folder: folder,
  filename: filename,
  server: server,
  danmu: danmu
}
