const path = require('path')
const url = require('url')
const fetch = require('node-fetch')
const { app, ipcMain, globalShortcut, BrowserWindow, Tray, nativeImage } = require('electron')
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

// Electron App
app.on('ready', () => {
  App.log.info(`app@danmu classroom running in ${App.env} mode`)
  // Danmu window
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

  // Dashboard window
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

  // Tray
  tray = new Tray(nativeImage.createFromPath(path.join(App.root, 'public/img/icon.png')).resize({
    width: 32,
    height: 32
  }))
  tray.setToolTip('danmu-classroom')
  tray.on('click', () => windows.dashboard.show())

  // Global shortcuts
  globalShortcut.register('CmdOrCtrl+Alt+I', () => windows.dashboard.openDevTools())
  globalShortcut.register('CmdOrCtrl+R', () => reconnectTunnel())

  // Detect displays
  displays = require('electron').screen.getAllDisplays()
})
app.on('activate', () => windows.dashboard.show())

// IPC listeners
ipcMain.on('dashboard-ready', (event) => {
  // Create Room
  fetch(url.resolve(App.config.upstream, 'api/rooms'), {method: 'POST'})
    .then(response => response.json())
    .then(result => {
      roomToken = result.auth_token
      roomKey = result.key
      windows.danmu.webContents.send('room-key', roomKey)
      windows.dashboard.webContents.send('room-key', roomKey)
      App.log.info(`app@room ${roomKey} created.`)
    })
})
ipcMain.on('quit-app', (event, message) => {
  // Close all windows
  for (let key in windows) {
    if (windows.hasOwnProperty(key) && windows[key] !== null) windows[key].destroy()
  }
  // Close tray
  if (tray !== null) tray.destroy()
  // Send before-quit event, event order: before-quit > will-quit > quit
  app.quit()
})
