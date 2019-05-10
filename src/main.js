const path = require('path')
const url = require('url')
const child_process = require('child_process')
const { app, ipcMain, globalShortcut, BrowserWindow, Tray, nativeImage } = require('electron')
const log = require('electron-log')
const { App } = require(path.join(__dirname, 'app'))

// Global references
global.windows = {
  danmu: null,
  dashboard: null
}
global.tray = null
global.displays = []
global.roomKey = null
global.roomToken = ''

// Express child process
const server = child_process.fork(path.join(App.root, 'child_processes/server.js'))
// Ngrok child process
const tunnel = child_process.fork(path.join(App.root, 'child_processes/tunnel.js'))
function reconnectTunnel() {
  tunnel.send({ action: 'reconnect' })
  windows.dashboard.webContents.send('connecting')
}

// Electron App
app.on('ready', () => {
  // danmu window
  windows.danmu = new BrowserWindow({
    frame: false,
    transparent: true
  })
  windows.danmu.maximize()
  windows.danmu.setIgnoreMouseEvents(true)
  windows.danmu.setAlwaysOnTop(true)
  windows.danmu.loadURL(url.format({
    pathname: path.join(App.root, 'renderers/danmu/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // dashboard window
  windows.dashboard = new BrowserWindow({
    minWidth: 450,
    minHeight: 450
  })
  windows.dashboard.maximize()
  windows.dashboard.loadURL(url.format({
    pathname: path.join(App.root, 'renderers/dashboard/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // tray
  tray = new Tray(nativeImage.createFromPath(path.join(App.root, 'public/img/icon.png')).resize({
    width: 32,
    height: 32
  }))
  tray.setToolTip('danmu-classroom')
  tray.on('click', () => windows.dashboard.show())
  // Global shortcuts
  globalShortcut.register('CmdOrCtrl+Alt+I', () => global.windows.dashboard.openDevTools())
  globalShortcut.register('CmdOrCtrl+R', () => reconnectTunnel())

  // detect displays
  displays = require('electron').screen.getAllDisplays()

  log.info(`app@danmu classroom running in ${App.env} mode`)
})
app.on('activate', () => windows.dashboard.show())
app.on('will-quit', () => {
  // send SIGTERM to child process
  if (!server.killed) server.kill()
  if (!tunnel.killed) tunnel.kill()
  log.info('app@danmu classroom closed')
})

// IPC listeners
ipcMain.on('reconnect-tunnel', (event, message) => reconnectTunnel())
ipcMain.on('quit-app', (event, message) => {
  // Close all windows
  for (let key in windows) {
    if (windows.hasOwnProperty(key) && windows[key] !== null) windows[key].destroy()
  }
  // Close tray
  if (global.tray !== null) global.tray.destroy()
  // Send before-quit event, event order: before-quit > will-quit > quit
  app.quit()
})

// Child process listeners
server.on('message', (message) => {
  // Danmu received
  if (message.status === 'ok') {
    windows.danmu.webContents.send('danmu', message.params)
  }
})
tunnel.on('message', (message) => {
  // Ngrok connected
  if (message.status === 'ok') {
    roomKey = String(message.room.key)
    roomToken = String(message.room.auth_token)
    windows.danmu.webContents.send('room-key-is', roomKey)
    windows.dashboard.webContents.send('room-key-is', roomKey)
  }
})
