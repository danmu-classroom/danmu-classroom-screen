const { ipcRenderer, remote } = require('electron')
const log = require('electron-log')
const { App } = remote.require('./app')

const danmus = []

// Setup canvas
const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')
cvs.width = window.innerWidth
cvs.height = window.innerHeight

// Danmu config
const danmusConfig = {
  speed: App.config.danmu.speed,
  fontFamily: App.config.danmu.fontFamily,
  fontSize: App.config.danmu.fontSize,
  color: App.config.danmu.color,
  strokeColor: App.config.danmu.strokeColor,
  strokeWidth: App.config.danmu.strokeWidth
}

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

// Auto create test danmu
function danmusSimulation() {
  let counter = 1

  function nextDanmu() {
    let randSec = Math.floor(Math.random() * 10000)
    console.log(randSec)
    setTimeout(() => {
      addDanmu(`我來報數拉 ${counter}`)
      counter += 1
      nextDanmu()
    }, randSec)
  }

  nextDanmu()
}

window.addEventListener('resize', () => {
  // Resize canvas to full window
  cvs.width = window.innerWidth
  cvs.height = window.innerHeight
})
window.addEventListener('beforeunload', () => ipcRenderer.send('quit-app'))
$(document).ready(() => {
  addDanmu('Danmu Classroom launched.')
  // danmusSimulation()
  window.requestAnimationFrame(draw)
})

// IPC listener
ipcRenderer.on('danmu', (event, message) => addDanmu(message.content)) // paint danmu
ipcRenderer.on('room-key-is', (event, key) => $('#key').text(key)) // update room key
ipcRenderer.on('danmu-config-is', (event, config) => updateConfig(config)) // update config
