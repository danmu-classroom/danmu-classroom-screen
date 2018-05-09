function addDanmu(message) {
  const danmu = $("<div></div>")
  danmu.addClass("danmu")
  danmu.text(message.content) // NOTE: xss fixed, do not use innerHtml for unsafe input
  danmu.on("animationend", () => danmu.remove()) // danmu animation end then destroy it
  danmu.appendTo($("#screen")) // paint to screen
}

$(document).ready(() => {
  logger.info(`${thisFilename}Win@ready`)
  // ask key
  ipcRenderer.send('ask-for-key')
  logger.info(`${thisFilename}Win@ask-for-key`)
  // init danmu
  addDanmu({
    content: 'Danmu Classroom launched.'
  })
})

// IPC listener
ipcRenderer.on('paint-danmu', (event, message) => { // paint danmu
  addDanmu(message)
  logger.info(`${thisFilename}Win@danmu-painted danmu: ${JSON.stringify(message)}`)
})
ipcRenderer.on('key-is', (event, key) => { // update key
  $("#key").text(key)
  logger.info(`${thisFilename}Win@key-rendered key: ${key}`)
})
