// setup canvas
const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')
cvs.width = window.innerWidth
cvs.height = window.innerHeight

// danmu config
const danmus = []
const danmusConfig = {
  speed: 5000, // 5000ms
  fontFamily: '思源柔黑體',
  fontSize: 100, // 100px
  color: '#fff',
  strokeColor: '#000',
  strokeWidth: 3, // 3px
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

// resize canvas to full window
window.addEventListener('resize', () => {
  cvs.width = window.innerWidth
  cvs.height = window.innerHeight
})

$(document).ready(() => {
  ipcRenderer.send('ask-for-room-key') // ask room key
  addDanmu('Danmu Classroom launched.') // send a danmu
  danmusSimulation()
  window.requestAnimationFrame(draw)
})

// IPC listener
ipcRenderer.on('paint-danmu', (event, message) => {
  addDanmu(message.content)
  logger.info(`app@danmu painted: ${JSON.stringify(message.content)}`)
})
ipcRenderer.on('update-room-key', (event, key) => $('#key').text(key)) // update key
ipcRenderer.on('change-config', (event, message) => { // change config
  danmusConfig.speed = message.speed
  danmusConfig.fontFamily = message.fontFamily
  danmusConfig.fontSize = message.fontSize
})
