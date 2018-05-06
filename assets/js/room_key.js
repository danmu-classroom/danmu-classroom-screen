const keyDom = document.getElementById("key")

function addKey(number) {
  keyDom.innerHTML = number
}

document.addEventListener("DOMContentLoaded", () => {
  logger.info('view@room-key@DOMContentLoaded')

  // ask key
  ipcRenderer.send('ask-for-key')
  logger.info('view@room-key@ask-for-key')

  // update key
  ipcRenderer.on('key-is', (event, key) => {
    addKey(key)
    event.sender.send('key-rendered', key)
    logger.info(`view@room-key@key-rendered key: ${key}`)
  })

  // control app
  const logBtn = document.getElementById("log-btn")
  const hideBtn = document.getElementById("hide-btn")
  const quitBtn = document.getElementById("quit-btn")

  logBtn.addEventListener('click', () => {
    ipcRenderer.send('open-log-window')
    logger.info('view@room-key@open-log-window')
  })

  hideBtn.addEventListener('click', () => {
    ipcRenderer.send('key-window-hide')
    logger.info('view@room-key@key-window-hide')
  })

  quitBtn.addEventListener('click', () => {
    logger.info('view@room-key@quit-app')
    ipcRenderer.send('quit-app')
  })
})
