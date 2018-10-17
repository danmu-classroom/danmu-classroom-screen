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

// DOM linsteners
logBtn.on('click', () => ipcRenderer.send('open-log-win'))
window.onbeforeunload = (event) => ipcRenderer.send('quit-app')
sendBtn.on('click', () => {
  const message = {
    content: $('#test-danmu').val()
  }
  $('#test-danmu').val(null)
  ipcRenderer.send('send-test-danmu', message)
})
offlineBtn.on('click', () => ipcRenderer.send('reconnect'))
$('input[name^=config-], select[name^=config-]').change(function() {
  let fontFamily = $('#config-font-family').val()
  let fontSize = $('#config-font-size').val()
  let danmuSpeed = $('#config-danmu-speed').val()
  let danmuConfig = {
    fontSize: fontSize,
    fontFamily: fontFamily,
    speed: danmuSpeed
  }
  ipcRenderer.send('change-config', danmuConfig)
})
window.addEventListener('offline', () => connectionStatus('offline'))

$(document).ready(() => ipcRenderer.send('ask-for-room-key')) // Ask for key

// IPC listener
ipcRenderer.on('update-room-key', (event, key) => {
  connectionStatus('online')
  $("#key").text(key) // update key
})
ipcRenderer.on('connecting', (event, message) => connectionStatus('connecting'))
