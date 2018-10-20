const path = require('path')
const url = require('url')
const {
  BrowserWindow,
  Tray,
  nativeImage
} = require('electron')
const folder = require(path.join(__dirname, '../config')).folder

exports.danmuWin = () => {
  let win = new BrowserWindow({
    frame: false,
    transparent: true
  })
  win.maximize()
  win.setIgnoreMouseEvents(true)
  win.setAlwaysOnTop(true)
  win.loadURL(url.format({
    pathname: path.join(folder.renderers, 'danmu/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  return win
}

exports.dashboardWin = () => {
  let win = new BrowserWindow({
    minWidth: 450,
    minHeight: 450
  })
  win.maximize()
  win.loadURL(url.format({
    pathname: path.join(folder.renderers, 'dashboard/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  return win
}

exports.appTray = () => {
  const icon = nativeImage.createFromPath(path.join(folder.public, 'img/icon.png')).resize({
    width: 32,
    height: 32
  })
  const tray = new Tray(icon)
  tray.setToolTip('Danmu')
  return tray
}
