const path = require('path')
const url = require('url')
const {
  BrowserWindow,
  Tray,
  nativeImage
} = require('electron')
const paths = require(path.join(__dirname, '../config')).paths
const logger = require(path.join(paths.lib, 'logger'))

exports.danmuWin = () => {
  let win = new BrowserWindow({
    frame: false,
    transparent: true
  })
  win.maximize()
  win.setIgnoreMouseEvents(true)
  win.setAlwaysOnTop(true)
  win.loadURL(url.format({
    pathname: path.join(paths.views, 'danmu.html'),
    protocol: 'file:',
    slashes: true
  }))
  return win
}

exports.dashboardWin = () => {
  let win = new BrowserWindow({
    width: 450,
    height: 450
  })
  win.loadURL(url.format({
    pathname: path.join(paths.views, 'dashboard.html'),
    protocol: 'file:',
    slashes: true
  }))
  return win
}

exports.appTray = () => {
  const icon = nativeImage.createFromPath(path.join(paths.assets, 'img/icon.png')).resize({
    width: 32,
    height: 32
  })
  const tray = new Tray(icon)
  tray.setToolTip('Danmu')
  return tray
}
