const path = require('path')
const child_process = require('child_process')
const folder = require(path.join(__dirname, '../config')).folder
const {
  app,
  ipcMain,
  globalShortcut
} = require('electron')
const logger = require(path.join(folder.main, 'logger'))
const components = require(path.join(folder.main, 'components'))

// Global references
global.wins = {
  danmu: null,
  dashboard: null
}
global.displays = []
global.appTray = null
global.roomKey = null
global.roomToken = ''

// Child processes
const server = child_process.fork(path.join(folder.childProcesses, 'server.js')) // run local server
const tunnel = child_process.fork(path.join(folder.childProcesses, 'tunnel.js')) // fetch ngrok and room

// App listeners
app.on('ready', () => {
  // require electron modules after app ready
  const screen = require('electron').screen
  logger.info('app@danmu classroom ready')

  // setup components
  global.wins.danmu = components.danmuWin()
  global.wins.dashboard = components.dashboardWin()
  global.appTray = components.appTray()

  // setup appTray
  global.appTray.on('click', () => global.wins.dashboard.show())

  // setup global shortcuts
  globalShortcut.register('CmdOrCtrl+Alt+I', () => global.wins.dashboard.openDevTools())
  globalShortcut.register('CmdOrCtrl+R', () => reconnectTunnel())

  // detect displays
  global.displays = require('electron').screen.getAllDisplays()
})
app.on('activate', () => global.wins.dashboard.show())
app.on('will-quit', () => {
  // send SIGTERM to child process
  if (!server.killed) server.kill()
  if (!tunnel.killed) tunnel.kill()
  logger.info('app@danmu classroom closed')
})

// IPC listeners
ipcMain.on('reconnect-tunnel', (event, message) => {
  event.sender.send('reconnect-tunnel')
  tunnel.send({
    action: 'reconnect'
  })
})
ipcMain.on('quit-app', (event, message) => {
  // close all windows
  for (let key in global.wins) {
    if (global.wins.hasOwnProperty(key) && global.wins[key] !== null) global.wins[key].destroy()
  }
  if (global.appTray !== null) global.appTray.destroy() // close tray
  app.quit() // send before-quit event, event order: before-quit > will-quit > quit
})

// Child process listeners
server.on('message', (message) => {
  if (message.status === 'ok') { // danmu received
    global.wins.danmu.webContents.send('danmu', message.params)
  }
})
tunnel.on('message', (message) => {
  if (message.status === 'ok') { // ngrok connected
    global.roomKey = String(message.room.key)
    global.roomToken = String(message.room.auth_token)
    global.wins.danmu.webContents.send('room-key-is', roomKey)
    global.wins.dashboard.webContents.send('room-key-is', roomKey)
  }
})
