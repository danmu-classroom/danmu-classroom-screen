const path = require('path')
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
