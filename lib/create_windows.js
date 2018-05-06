const path = require('path')
const url = require('url')
const BrowserWindow = require('electron').BrowserWindow
const viewsPath = require(path.join(__dirname, '../config')).viewsPath

function danmu() {
  const window = new BrowserWindow({
    frame: false,
    transparent: true,
  })
  window.maximize()
  window.setIgnoreMouseEvents(true)
  window.setAlwaysOnTop(true)
  window.loadURL(url.format({
    pathname: path.join(viewsPath, 'danmu.html'),
    protocol: 'file:',
    slashes: true
  }))
  return window
}

function danmuDebug() {
  const window = new BrowserWindow()
  window.maximize()
  window.loadURL(url.format({
    pathname: path.join(viewsPath, 'danmu.html'),
    protocol: 'file:',
    slashes: true
  }))
  window.webContents.openDevTools()
  return window
}

function roomKey() {
  const window = new BrowserWindow({
    width: 450,
    height: 450
  })
  window.loadURL(url.format({
    pathname: path.join(viewsPath, 'room_key.html'),
    protocol: 'file:',
    slashes: true
  }))
  return window
}

function log() {
  const window = new BrowserWindow({})
  window.loadURL(url.format({
    pathname: path.join(viewsPath, 'log.html'),
    protocol: 'file:',
    slashes: true
  }))
  return window
}

// common js module export
module.exports = {
  danmu: danmu,
  danmuDebug: danmuDebug,
  roomKey: roomKey,
  log: log
}
