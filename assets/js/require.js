const path = require('path')
const fs = require('fs')
const tail = require('tail')
const ipcRenderer = require('electron').ipcRenderer
const {
  libPath,
  logPath
} = require('../config')
const logger = require(path.join(libPath, 'logger'))
const $ = require('jquery')
const JQuery = $;
const Popper = require('popper.js')
require('bootstrap')
