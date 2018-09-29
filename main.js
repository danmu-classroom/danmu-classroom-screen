const path = require('path')
const child_process = require('child_process')
const paths = require(path.join(__dirname, 'config')).paths
const components = require(path.join(paths.lib, 'components'))
const logger = require(path.join(paths.lib, 'logger'))
const {
  app,
  ipcMain
} = require('electron')

// Global references
let appTray = null
const wins = {
  danmu: null,
  dashboard: null,
  log: null
}
let roomKey = null

// Child process
const server = child_process.fork(path.join(paths.proc, 'server.js')) // run express server
const tunnel = child_process.fork(path.join(paths.proc, 'tunnel.js')) // fetch ngrok and room

// Functions
function exitApp() {
  // close all windows
  for (let key in wins) {
    if (wins.hasOwnProperty(key) && wins[key] !== null) wins[key].destroy()
  }
  if (appTray !== null) appTray.destroy() // close tray
  app.quit() // send before-quit event // event order: before-quit > will-quit > quit
}

// App listener
app.on('ready', () => {
  logger.info('app@danmu classroom ready')
  appTray = components.appTray()
  wins.danmu = components.danmuWin()
  wins.dashboard = components.dashboardWin()
  appTray.on('click', () => wins.dashboard.show())
})
app.on('activate', () => wins.dashboard.show())
app.on('will-quit', () => {
  // send SIGTERM to child process
  if (!server.killed) server.kill()
  if (!tunnel.killed) tunnel.kill()
  logger.info('app@danmu classroom closed')
})

// IPC listener
ipcMain.on('ask-for-room-key', (event, message) => event.sender.send('update-room-key', roomKey))
ipcMain.on('change-config', (event, message) => wins.danmu.webContents.send('change-config', message))
ipcMain.on('open-log-win', (event, message) => {
  if (wins.log === null) wins.log = components.logWin()
  if (!wins.log.isVisible()) wins.log.show()
})
ipcMain.on('send-test-danmu', (event, message) => wins.danmu.webContents.send('paint-danmu', message))
ipcMain.on('quit-app', (event, message) => exitApp())

// Child process listener
server.on('message', (message) => {
  if (message.status === 'ok') { // danmu received
    wins.danmu.webContents.send('paint-danmu', message.params)
  }
})
tunnel.on('message', (message) => {
  if (message.status === 'ok') { // ngrok connected
    roomKey = String(message.key)
    wins.danmu.webContents.send('update-room-key', roomKey)
    wins.dashboard.webContents.send('update-room-key', roomKey)
  }
})
