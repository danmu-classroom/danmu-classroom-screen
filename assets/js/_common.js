const path = require('path')
const fs = require('fs')
const mousetrap = require('mousetrap')
const tail = require('tail')
const {
  ipcRenderer,
  remote
} = require('electron')
const paths = require('../config').paths
const logger = require(path.join(paths.lib, 'logger'))
const $ = require('jquery')
const JQuery = $;
const Popper = require('popper.js')
require('bootstrap')
const thisFilename = path.basename(__filename)
const thisWindow = remote.getCurrentWindow()

// Hide or minimize instead of close the window
function hideOrMin() {
  if (process.platform === 'darwin') {
    thisWindow.hide()
  } else {
    thisWindow.minimize()
  }
}

// Window listener
window.onbeforeunload = (e) => {
  hideOrMin()
  e.returnValue = false
}

// BrowserWindow listener
thisWindow.on('close', () => {
  logger.info(`view@${thisFilename}@close`)
})
thisWindow.on('minimize', () => {
  logger.info(`view@${thisFilename}@minimize`)
})
thisWindow.on('hide', () => {
  logger.info(`view@${thisFilename}@hide`)
})
thisWindow.on('restore', () => {
  logger.info(`view@${thisFilename}@restore`)
})
thisWindow.on('show', () => {
  logger.info(`view@${thisFilename}@show`)
})
thisWindow.on('closed', () => {
  thisWindow = null
  logger.info(`view@${thisFilename}@closed`)
})

// User input listener
mousetrap.bind(['command+alt+i', 'ctrl+shift+i'], function() {
  thisWindow.openDevTools() // open devtools
  logger.info(`view@${thisFilename}@open-devtools`)
})
