const keyDom = document.getElementById("key")

function addKey(number) {
  keyDom.innerHTML = number
}

document.addEventListener("DOMContentLoaded", () => {
  logger.info(`${thisFilename}Win@DOMContentLoaded`)

  // IPC listener
  ipcRenderer.send('ask-for-key') // ask key
  logger.info('view@key@ask-for-key')
  ipcRenderer.on('key-is', (event, key) => { // update key
    addKey(key)
    logger.info(`${thisFilename}Win@key-rendered key: ${key}`)
  })

  // Buttons linstener
  const logBtn = document.getElementById("log-btn")
  const hideBtn = document.getElementById("hide-btn")
  const quitBtn = document.getElementById("quit-btn")
  logBtn.addEventListener('click', () => {
    ipcRenderer.send('open-log')
    logger.info(`${thisFilename}Win@open-log`)
  })
  hideBtn.addEventListener('click', () => {
    hideOrMin()
  })
  quitBtn.addEventListener('click', () => {
    ipcRenderer.send('quit-app')
    logger.info(`${thisFilename}Win@quit-app`)
  })
})
