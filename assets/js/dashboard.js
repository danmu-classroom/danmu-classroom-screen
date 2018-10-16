const logBtn = $("#log-btn")
const hideBtn = $("#hide-btn")
const quitBtn = $("#quit-btn")
const sendBtn = $("#send-btn")

// Buttons linstener
logBtn.on('click', () => ipcRenderer.send('open-log-win'))
hideBtn.on('click', () => thisWindow.hide())
quitBtn.on('click', () => ipcRenderer.send('quit-app'))
sendBtn.on('click', () => {
  const message = {
    content: $('#test-danmu').val()
  }
  $('#test-danmu').val(null)
  ipcRenderer.send('send-test-danmu', message)
})

// Form linstener
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

$(document).ready(() => ipcRenderer.send('ask-for-room-key')) // Ask for key

// IPC listener
ipcRenderer.on('update-room-key', (event, key) => $("#key").text(key)) // update key
