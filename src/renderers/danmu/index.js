const url = require('url')
const { ipcRenderer, remote } = require('electron')
const { App } = remote.require('./app')
const dashboardWin = remote.getGlobal('windows').dashboard
const danmus = []
let roomKey = ''
let roomToken = ''

// Danmu config
const danmusConfig = {
  speed: App.config.danmu.speed,
  fontFamily: App.config.danmu.fontFamily,
  fontSize: App.config.danmu.fontSize,
  color: App.config.danmu.color,
  strokeColor: App.config.danmu.strokeColor,
  strokeWidth: App.config.danmu.strokeWidth
}

// Setup canvas
const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')
cvs.width = window.innerWidth
cvs.height = window.innerHeight

function draw() {
  let now = Date.now()

  // Clear canvas and apply config to canvas
  ctx.clearRect(0, 0, cvs.width, cvs.height)
  ctx.font = `${danmusConfig.fontSize}px ${danmusConfig.fontFamily}`;
  ctx.fillStyle = danmusConfig.color
  ctx.strokeStyle = danmusConfig.strokeColor
  ctx.lineWidth = danmusConfig.strokeWidth

  danmus.forEach((value, index) => {
    // Compute and danmu's x, and update it to canvas
    value.x = cvs.width - cvs.width * (now - value.initTime) / danmusConfig.speed
    if ((value.x + value.width) > 0) {
      // Painting danmu
      ctx.fillText(value.content, value.x, value.y)
      ctx.strokeText(value.content, value.x, value.y)
    } else {
      // Danmu is ending, remove it
      danmus.splice(index, 1)
    }
  })

  // Use recursive to update canvas
  window.requestAnimationFrame(draw)
}

function addDanmu(content) {
  let danmu = {
    content: content,
    x: cvs.width,
    y: Math.floor(Math.random() * cvs.height),
    initTime: Date.now(),
    width: ctx.measureText(content).width
  }
  danmus.push(danmu)
  App.log.info(`app@danmu painted: ${content}`)
}

function updateConfig(config) {
  // Update configs
  if (config.speed != null) danmusConfig.speed = config.speed
  if (config.fontFamily != null) danmusConfig.fontFamily = config.fontFamily
  if (config.fontSize != null) danmusConfig.fontSize = config.fontSize
  App.log.info(`app@danmu config update: ${JSON.stringify(config)}`)
}

async function getDanmus(upstream) {
  const response = await fetch(upstream)
  const result = await response.json()
  return result
}

function poolingDanmus(upstream) {
  getDanmus(upstream)
    .then(result => result.forEach(danmu => addDanmu(danmu.content)))
    .catch(error => App.log.error(`app@danmu: ${error}`))
  setTimeout(() => poolingDanmus(upstream), 900)
}

window.addEventListener('resize', () => {
  // Resize canvas to full window
  cvs.width = window.innerWidth
  cvs.height = window.innerHeight
})
window.addEventListener('beforeunload', () => ipcRenderer.send('quit-app'))
$(document).ready(() => window.requestAnimationFrame(draw))

// IPC listener
ipcRenderer.on('room-key', (event) => {
  // Update room key and token
  roomKey = remote.getGlobal('roomKey')
  roomToken = remote.getGlobal('roomToken')
  $('#key').text(roomKey)
  addDanmu(`歡迎使用彈幕教室，房間號碼 ${roomKey}`)
  // Start pooling danmus
  poolingDanmus(url.resolve(App.config.upstream, `api/rooms/${roomKey}/danmus?auth_token=${roomToken}`))
})
ipcRenderer.on('danmu', (event, message) => addDanmu(message.content)) // paint danmu
ipcRenderer.on('danmu-config', (event, config) => updateConfig(config)) // Update config
