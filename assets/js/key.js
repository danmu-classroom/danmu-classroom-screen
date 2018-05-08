const keyDom = document.getElementById("key")

function addKey(number) {
  keyDom.innerHTML = number
}

document.addEventListener("DOMContentLoaded", () => {
  logger.info('view@key@DOMContentLoaded')

  // IPC listener
  ipcRenderer.send('ask-for-key') // ask key
  logger.info('view@key@ask-for-key')
  ipcRenderer.on('key-is', (event, key) => { // update key
    addKey(key)
    logger.info(`view@key@key-rendered key: ${key}`)
  })

  // Buttons linstener
  const logBtn = document.getElementById("log-btn")
  const hideBtn = document.getElementById("hide-btn")
  const quitBtn = document.getElementById("quit-btn")
  logBtn.addEventListener('click', () => {
    ipcRenderer.send('open-log')
    logger.info('view@key@open-log')
  })
  hideBtn.addEventListener('click', () => {
    hideOrMin()
  })
  quitBtn.addEventListener('click', () => {
    ipcRenderer.send('quit-app')
    logger.info('view@key@quit-app')
  })
})
