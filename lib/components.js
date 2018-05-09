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

  win.on('minimize', () => logger.info(`danmuWin@minimize`))
  win.on('hide', () => logger.info(`danmuWin@hide`))
  win.on('restore', () => logger.info(`danmuWin@restore`))
  win.on('show', () => logger.info(`danmuWin@show`))
  win.on('close', (event) => logger.info(`danmuWin@close`))
  win.on('closed', () => {
    win = null
    logger.info(`danmuWin@closed`)
  })
  return win
}

exports.keyWin = () => {
  let win = new BrowserWindow({
    width: 450,
    height: 450
  })
  win.loadURL(url.format({
    pathname: path.join(paths.views, 'key.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('minimize', () => logger.info(`keyWin@minimize`))
  win.on('hide', () => logger.info(`keyWin@hide`))
  win.on('restore', () => logger.info(`keyWin@restore`))
  win.on('show', () => logger.info(`keyWin@show`))
  win.on('close', (event) => logger.info(`keyWin@close`))
  win.on('closed', () => {
    win = null
    logger.info(`keyWin@closed`)
  })

  return win
}

exports.logWin = () => {
  let win = new BrowserWindow({})
  win.loadURL(url.format({
    pathname: path.join(paths.views, 'log.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('minimize', () => logger.info(`logWin@minimize`))
  win.on('hide', () => logger.info(`logWin@hide`))
  win.on('restore', () => logger.info(`logWin@restore`))
  win.on('show', () => logger.info(`logWin@show`))
  win.on('close', () => logger.info(`logWin@show`))
  win.on('closed', () => {
    win = null
    logger.info(`logWin@closed`)
  })

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
