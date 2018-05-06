const path = require('path')
const child_process = require('child_process')
const {
  libPath,
  processPath,
  webhookPath
} = require(path.join(__dirname, 'config'))
const createWindow = require(path.join(libPath, 'create_windows'))
const logger = require(path.join(libPath, 'logger'))
const {
  app,
  ipcMain
} = require('electron')

// global ref
let mainWindow = null
let keyWindow = null
let logWindow = null
let roomKey = null

// run express server
const server = child_process.fork(path.join(processPath, 'server.js'))

// run ngrok
const createRoom = child_process.fork(path.join(processPath, 'create_room.js'))

function exitApp() {
  server.kill()
  createRoom.kill()
  if (mainWindow !== null) {
    mainWindow.close()
  }
  if (keyWindow !== null) {
    keyWindow.close()
  }
  if (logWindow !== null) {
    logWindow.close()
  }
  app.quit()
}

function createDanmuWindow() {
  if (mainWindow === null) {
    mainWindow = createWindow.danmu()
    mainWindow.on('closed', () => {
      logger.info('main@danmu-window-closed')
      mainWindow = null
    })
  }
}

function createKeyWindow() {
  if (keyWindow === null) {
    keyWindow = createWindow.roomKey()
    keyWindow.on('closed', () => {
      logger.info('main@key-window-closed')
      keyWindow = null
    })
    keyWindow.on('hide', () => {
      logger.info('main@key-window-hide')
    })
  }
}

function createLogWindow() {
  if (logWindow === null) {
    logWindow = createWindow.log()
    logWindow.on('closed', () => {
      logger.info('main@log-window-closed')
      logWindow = null
    })
  }
}

// app
app.on('ready', () => {
  logger.info('main@app-ready')
  createDanmuWindow()
  createKeyWindow()
})
app.on('activate', () => {
  logger.info('main@app-activate')
  createDanmuWindow()
  createKeyWindow()
  if (keyWindow.isMinimized()) {
    logger.info('main@key-window-restore')
    keyWindow.restore()
  }
  if (!keyWindow.isVisible()) {
    logger.info('main@key-window-show')
    keyWindow.show()
  }
})
app.on('window-all-closed', () => {
  logger.info('main@app-window-all-closed')
  if (process.platform !== 'darwin') {
    exitApp()
  }
})

// IPC between main and renderer
ipcMain.on('danmu-painted', (event, danmu) => {})
ipcMain.on('key-rendered', (event, key) => {})
ipcMain.on('ask-for-key', (event, message) => event.sender.send('key-is', roomKey))
ipcMain.on('key-window-hide', (event, message) => {
  keyWindow.hide()
})
ipcMain.on('open-log-window', (event, message) => {
  createLogWindow()
  if (logWindow.isMinimized()) {
    logger.info('main@log-window-restore')
    logWindow.restore()
  }
  if (!logWindow.isVisible()) {
    logger.info('main@log-window-show')
    logWindow.show()
  }
})
ipcMain.on('quit-app', (event, message) => {
  logger.info('main@quit-app')
  exitApp()
})


// IPC between main and child_process
server.on('message', (message) => {
  // danmu received
  if (message.status === 'ok') {
    mainWindow.webContents.send('paint-danmu', message.params)
  }
})

createRoom.on('message', (message) => {
  // ngrok connected
  if (message.status === 'ok') {
    // get room key
    roomKey = String(message.key)
    mainWindow.webContents.send('key-is', roomKey)
    keyWindow.webContents.send('key-is', roomKey)
  }
})
