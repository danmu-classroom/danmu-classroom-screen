const {
  ipcRenderer,
  remote
} = require('electron')
const {
  folder,
  danmu
} = remote.require('../config')
const logger = remote.require('./logger')

// setup canvas
const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')
cvs.width = window.innerWidth
cvs.height = window.innerHeight

// danmu config
const danmus = []
const danmusConfig = {
  speed: danmu.default.speed,
  fontFamily: danmu.default.fontFamily,
  fontSize: danmu.default.fontSize,
  color: danmu.default.color,
  strokeColor: danmu.default.strokeColor,
  strokeWidth: danmu.default.strokeWidth
}

function draw() {
  let now = Date.now()

  // apply config to canvas
  ctx.clearRect(0, 0, cvs.width, cvs.height) // clear canvas
  ctx.font = `${danmusConfig.fontSize}px ${danmusConfig.fontFamily}`;
  ctx.fillStyle = danmusConfig.color
  ctx.strokeStyle = danmusConfig.strokeColor
  ctx.lineWidth = danmusConfig.strokeWidth

  danmus.forEach((value, index) => {
    value.x = cvs.width - cvs.width * (now - value.initTime) / danmusConfig.speed // compute and update danmu's x
    if ((value.x + value.width) > 0) {
      // painting danmu
      ctx.fillText(value.content, value.x, value.y)
      ctx.strokeText(value.content, value.x, value.y)
    } else {
      // danmu is ending, remove it
      danmus.splice(index, 1)
    }
  })

  // use recursive to update canvas
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
  logger.info(`app@danmu painted: ${content}`)
}

function updateConfig(config) {
  // update configs
  if (config.speed != null) danmusConfig.speed = config.speed
  if (config.fontFamily != null) danmusConfig.fontFamily = config.fontFamily
  if (config.fontSize != null) danmusConfig.fontSize = config.fontSize
  logger.info(`app@danmu config update: ${JSON.stringify(config)}`)
}

// auto create danmus
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
  // resize canvas to full window
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
