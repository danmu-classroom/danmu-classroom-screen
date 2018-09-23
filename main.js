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
const createRoom = child_process.fork(path.join(paths.proc, 'create_room.js')) // fetch ngrok and room

// Functions
function exitApp() {
  // destroy all windows and clean global references
  for (let key in wins) {
    if (wins.hasOwnProperty(key) && wins[key] !== null) {
      wins[key].destroy()
      wins[key] = null
    }
  }
  // destroy tray and clean global reference
  if (appTray !== null) {
    appTray.destroy()
    appTray = null
  }
  // send before-quit event, event order: before-quit > will-quit > quit
  app.quit()
}

function activateDanmuWin() {
  if (wins.danmu === null) wins.danmu = components.danmuWin()
}

function activateDashboardWin() {
  if (wins.dashboard === null) wins.dashboard = components.dashboardWin()
  if (!wins.dashboard.isVisible()) wins.dashboard.show()
}

function activatelogWin() {
  if (wins.log === null) wins.log = components.logWin()
  if (!wins.log.isVisible()) wins.log.show()
}

// App listener
app.on('ready', () => {
  logger.info('main@app-ready')
  appTray = components.appTray()
  appTray.on('click', () => {
    logger.info('appTray@click')
    activateDanmuWin()
    activateDashboardWin()
  })
  activateDanmuWin()
  activateDashboardWin()
})
app.on('activate', () => {
  logger.info('main@app-activate')
  activateDanmuWin()
  activateDashboardWin()
})
app.on('will-quit', () => {
  // send SIGTERM to child process
  if (!server.killed) server.kill()
  if (!createRoom.killed) createRoom.kill()
})

// IPC listener
ipcMain.on('ask-for-key', (event, message) => event.sender.send('key-is', roomKey))
ipcMain.on('change-config', (event, message) => wins.danmu.webContents.send('change-config', message))
ipcMain.on('open-log', (event, message) => activatelogWin())
ipcMain.on('quit-app', (event, message) => {
  logger.info('main@quit-app')
  exitApp()
})

// Child process listener
server.on('message', (message) => {
  if (message.status === 'ok') { // danmu received
    wins.danmu.webContents.send('paint-danmu', message.params)
  }
})
createRoom.on('message', (message) => {
  if (message.status === 'ok') { // ngrok connected
    roomKey = String(message.key)
    wins.danmu.webContents.send('key-is', roomKey)
    wins.dashboard.webContents.send('key-is', roomKey)
  }
})
