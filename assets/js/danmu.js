const screen = document.getElementById("screen")
const keyDom = document.getElementById("key")

function addDanmu(message) {
  // create danmu
  const danmu = document.createElement('div')
  danmu.classList.add('danmu')
  danmu.innerHTML = message.content

  // danmu animation end then destroy it
  danmu.addEventListener("animationend", () => {
    danmu.parentNode.removeChild(danmu)
  }, false);

  // paint to screen
  screen.appendChild(danmu)
}

function addKey(number) {
  keyDom.innerHTML = number
}

document.addEventListener("DOMContentLoaded", () => {
  logger.info('view@danmu@DOMContentLoaded')

  // init danmu
  addDanmu({
    content: 'Danmu Classroom launched.'
  })

  // paint danmu
  ipcRenderer.on('paint-danmu', (event, message) => {
    addDanmu(message)
    event.sender.send('danmu-painted', message)
    logger.info(`view@danmu@danmu-painted danmu: ${JSON.stringify(message)}`)
  })

  // ask key
  ipcRenderer.send('ask-for-key')
  logger.info('view@danmu@ask-for-key')

  // update key
  ipcRenderer.on('key-is', (event, key) => {
    addKey(key)
    event.sender.send('key-rendered', key)
    logger.info(`view@danmu@key-rendered key: ${key}`)
  })
});
