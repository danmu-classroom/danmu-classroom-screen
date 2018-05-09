$(document).ready(() => {
  logger.info(`${thisFilename}Win@ready`)

  // IPC listener
  ipcRenderer.send('ask-for-key') // ask key
  logger.info('view@key@ask-for-key')

  // Buttons linstener
  const logBtn = $("#log-btn")
  const hideBtn = $("#hide-btn")
  const quitBtn = $("#quit-btn")
  logBtn.on('click', () => {
    ipcRenderer.send('open-log')
    logger.info(`${thisFilename}Win@open-log`)
  })
  hideBtn.on('click', () => {
    thisWindow.hide()
  })
  quitBtn.on('click', () => {
    ipcRenderer.send('quit-app')
    logger.info(`${thisFilename}Win@quit-app`)
  })
})

ipcRenderer.on('key-is', (event, key) => { // update key
  $("#key").text(key)
  logger.info(`${thisFilename}Win@key-rendered key: ${key}`)
})
