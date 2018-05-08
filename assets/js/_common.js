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
