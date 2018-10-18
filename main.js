const path = require('path')
const child_process = require('child_process')
const paths = require(path.join(__dirname, 'config')).paths
const components = require(path.join(paths.lib, 'components'))
const logger = require(path.join(paths.lib, 'logger'))
const {
  app,
  ipcMain,
  shell,
  globalShortcut
} = require('electron')

// Global references
let appTray = null
const wins = {
  danmu: null,
  dashboard: null
}
let roomKey = null
let roomToken = ''

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

function reconnectTunnel() {
  tunnel.send({
    action: 'reconnect'
  })
  wins.dashboard.webContents.send('connecting')
}

// App listener
app.on('ready', () => {
  logger.info('app@danmu classroom ready')
  appTray = components.appTray()
  wins.danmu = components.danmuWin()
  wins.dashboard = components.dashboardWin()
  // setup appTray
  appTray.on('click', () => wins.dashboard.show())
  // setup global shortcut
  globalShortcut.register('CmdOrCtrl+Alt+I', () => wins.dashboard.openDevTools())
  globalShortcut.register('CmdOrCtrl+R', () => reconnectTunnel())
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
ipcMain.on('open-log-win', (event, message) => shell.showItemInFolder(path.join(paths.log, 'app.log')))
ipcMain.on('send-test-danmu', (event, message) => wins.danmu.webContents.send('paint-danmu', message))
ipcMain.on('reconnect', (event, message) => reconnectTunnel())
ipcMain.on('quit-app', (event, message) => exitApp())

// Child process listener
server.on('message', (message) => {
  if (message.status === 'ok') { // danmu received
    wins.danmu.webContents.send('paint-danmu', message.params)
  }
})
tunnel.on('message', (message) => {
  if (message.status === 'ok') { // ngrok connected
    roomKey = String(message.room.key)
    roomToken = String(message.room.auth_token)
    wins.danmu.webContents.send('update-room-key', roomKey)
    wins.dashboard.webContents.send('update-room-key', roomKey)
  }
})
