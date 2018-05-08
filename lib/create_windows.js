const path = require('path')
const url = require('url')
const BrowserWindow = require('electron').BrowserWindow
const paths = require(path.join(__dirname, '../config')).paths

exports.danmu = () => {
  const window = new BrowserWindow({
    frame: false,
    transparent: true,
  })
  window.maximize()
  window.setIgnoreMouseEvents(true)
  window.setAlwaysOnTop(true)
  window.loadURL(url.format({
    pathname: path.join(paths.views, 'danmu.html'),
    protocol: 'file:',
    slashes: true
  }))
  return window
}

exports.roomKey = () => {
  const window = new BrowserWindow({
    width: 450,
    height: 450
  })
  window.loadURL(url.format({
    pathname: path.join(paths.views, 'key.html'),
    protocol: 'file:',
    slashes: true
  }))
  return window
}

exports.log = () => {
  const window = new BrowserWindow({})
  window.loadURL(url.format({
    pathname: path.join(paths.views, 'log.html'),
    protocol: 'file:',
    slashes: true
  }))
  return window
}
