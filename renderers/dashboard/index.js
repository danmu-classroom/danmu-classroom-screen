const path = require('path')
const {
  ipcRenderer,
  remote
} = require('electron')
const {
  folder,
  filename
} = remote.require('../config')

const danmuWin = remote.getGlobal('wins').danmu
const displays = remote.getGlobal('displays')
const logBtn = $("#log-btn")
const sendBtn = $("#send-btn")
const offlineBtn = $("#connection-offline")
const onlineBtn = $("#connection-online")
const connectingBtn = $("#connection-connecting")

function connectionStatus(status) {
  if (status == 'online') {
    onlineBtn.removeClass('d-none')
    offlineBtn.addClass('d-none')
    connectingBtn.addClass('d-none')
  } else if (status == 'connecting') {
    connectingBtn.removeClass('d-none')
    offlineBtn.addClass('d-none')
    onlineBtn.addClass('d-none')
  } else if (status == 'offline') {
    offlineBtn.removeClass('d-none')
    connectingBtn.addClass('d-none')
    onlineBtn.addClass('d-none')
  }
}

function displayRadioHTML(order, id) {
  const radio = `
  <div class="form-check form-check-inline">
    <input class="form-check-input" type="radio" name="config-danmu-display" id="config-danmu-display${order}" value="${id}">
    <label class="form-check-label" for="config-danmu-display${order}">${order}</label>
  </div>
  `
  return radio
}

function sendTestDanmu() {
  const message = {
    content: $('#test-danmu').val()
  }
  $('#test-danmu').val(null)
  return message
}

// DOM linsteners
window.addEventListener('beforeunload', () => ipcRenderer.send('quit-app'))
window.addEventListener('offline', () => connectionStatus('offline'))
logBtn.on('click', () => remote.shell.showItemInFolder(path.join(folder.log, filename.appLog)))
sendBtn.on('click', () => danmuWin.webContents.send('danmu', sendTestDanmu()))
offlineBtn.on('click', () => ipcRenderer.send('reconnect-tunnel'))
$('input[name^=config-], select[name^=config-]').change(() => {
  let fontFamily = $('#config-font-family').val()
  let fontSize = $('#config-font-size').val()
  let danmuSpeed = $('#config-danmu-speed').val()
  let danmuConfig = {
    fontSize: fontSize,
    fontFamily: fontFamily,
    speed: danmuSpeed
  }
  $('body').css('font-family', fontFamily)
  danmuWin.webContents.send('danmu-config-is', danmuConfig)
})

$(document).ready(() => {
  // setup radios for displays
  const displaysForm = $('#displays-form')
  displays.forEach((display, index) => {
    displaysForm.append(displayRadioHTML(index + 1, display.id))
  })
  $('#config-danmu-display1').prop('checked', true)
  // change display
  $('input[name=config-danmu-display]').change(() => {
    let danmuDisplay = displays.find((display, index) => {
      return display.id == $('input[name=config-danmu-display]:checked').val()
    })
    danmuWin.setBounds(danmuDisplay.bounds)
  })
})

// IPC listeners
ipcRenderer.on('room-key-is', (event, key) => {
  connectionStatus('online')
  $("#key").text(key) // update key
})
ipcRenderer.on('connecting', (event, key) => connectionStatus('connecting'))
