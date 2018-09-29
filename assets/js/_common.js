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
const thisFilename = path.basename(__filename, '.html')
const thisWindow = remote.getCurrentWindow()

// when close, just hide
window.onbeforeunload = (event) => {
  thisWindow.hide()
  event.returnValue = false
}

// User input listener
mousetrap.bind(['command+alt+i', 'ctrl+shift+i'], function() {
  thisWindow.openDevTools() // open devtools
})
