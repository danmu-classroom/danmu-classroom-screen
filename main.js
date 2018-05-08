const path = require('path')
const child_process = require('child_process')
const paths = require(path.join(__dirname, 'config')).paths
const createWindow = require(path.join(paths.lib, 'create_windows'))
const logger = require(path.join(paths.lib, 'logger'))

const {
  app,
  ipcMain,
  Tray
} = require('electron')

// Global references
var win_tray = null
const wins = {
  danmu: null,
  key: null,
  log: null
}
let roomKey = null

// Child process
const server = child_process.fork(path.join(paths.proc, 'server.js')) // run express server
const createRoom = child_process.fork(path.join(paths.proc, 'create_room.js')) // fetch ngrok and room

// Functions
function exitApp() {
  if (!server.killed) {
    server.kill()
  }
  if (!createRoom.killed) {
    createRoom.kill()
  }
  for (let key in wins) { // close all windows and clean global references
    if (wins.hasOwnProperty(key)) {
      if (wins[key] !== null) {
        wins[key].destroy()
        wins[key] = null
      }
    }
  }
  app.quit()
}

function trayIcon(){
  if(win_tray === null){
    win_tray = new Tray(path.join(paths.assets, 'img/icon.png'))
    win_tray.setToolTip('Danmu Class')
  }
}

function danmuWin() {
  if (wins.danmu === null) {
    wins.danmu = createWindow.danmu()
    wins.danmu.on('closed', () => (wins.danmu = null))
  }
}

function keyWin() {
  trayIcon()
  if (wins.key === null) {
    wins.key = createWindow.roomKey()
    wins.key.on('closed', () => (wins.key = null))
  } else if (wins.key.isMinimized()) {
    wins.key.restore()
  } else if (!wins.key.isVisible()) {
    wins.key.show()
  }
  win_tray.on('click', () => {wins.key.isVisible() ? wins.key.hide() : wins.key.show()})

}

function logWin() {
  if (wins.log === null) {
    wins.log = createWindow.log()
    wins.log.on('closed', () => (wins.log = null))
  } else if (wins.log.isMinimized()) {
    wins.log.restore()
  } else if (!wins.log.isVisible()) {
    wins.log.show()
  }
}

// App listener
app.on('ready', () => {
  logger.info('main@app-ready')
  trayIcon()
  danmuWin()
  keyWin()
})
app.on('activate', () => {
  logger.info('main@app-activate')
  trayIcon()
  danmuWin()
  keyWin()
})

// IPC listener
ipcMain.on('ask-for-key', (event, message) => event.sender.send('key-is', roomKey))
ipcMain.on('open-log', (event, message) => {
  logWin()
})
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
    wins.key.webContents.send('key-is', roomKey)
  }
})
