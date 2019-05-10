const path = require('path')
const url = require('url')
const { ipcRenderer, remote } = require('electron')
const log = require('electron-log')
const { App } = remote.require('./app')

const danmuWin = remote.getGlobal('windows').danmu
const displays = remote.getGlobal('displays')
const logBtn = $("#log-btn")
const sendBtn = $("#send-btn")
const offlineBtn = $("#connection-offline")
const onlineBtn = $("#connection-online")
const connectingBtn = $("#connection-connecting")
const loginBtn = $("#user-login")

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

function updateRoomCreater() {
  const auth_token = remote.getGlobal('roomToken')
  const key = remote.getGlobal('roomKey')
  const body = {
    user: {
      email: $('#user-email').val(),
      password: $('#user-password').val()
    },
    auth_token: auth_token
  }

  // POST https://danmu-classroom.herokuapp.com/api/rooms/${key}/update_creater
  fetch(url.resolve(App.config.upstream, `api/rooms/${key}/update_creater`), {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
    .then(res => {
      if (res.ok) return res.json()
      return Promise.reject(res)
    })
    .then(body => {
      $('#user-login').text('登入成功')
      $('#user-login').addClass('disabled')
    })
    .catch(err => {
      $('#user-password').val(null)
      console.error(`status: ${err.statusText}`)
      err.json().then(body => console.error(`error: ${JSON.stringify(body)}`))
    })
}

function sendDanmuConfigs() {
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
}

// DOM linsteners
window.addEventListener('beforeunload', () => ipcRenderer.send('quit-app'))
window.addEventListener('offline', () => connectionStatus('offline'))
logBtn.on('click', () => remote.shell.showItemInFolder(App.log.transports.file.findLogPath()))
sendBtn.on('click', () => danmuWin.webContents.send('danmu', sendTestDanmu()))
offlineBtn.on('click', () => ipcRenderer.send('reconnect-tunnel'))
loginBtn.on('click', () => updateRoomCreater())
$('input[name^=config-], select[name^=config-]').change(() => sendDanmuConfigs())

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
