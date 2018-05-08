const thisWindow = remote.getCurrentWindow()
thisWindow.on('closed', () => {
  logger.info('view@log@closed')
  thisWindow = null
})
thisWindow.on('show', () => {
  logger.info('view@log@show')
})
thisWindow.on('restore', () => {
  logger.info('view@log@restore')
})

const logFile = path.join(paths.log, 'danmu.log')
const logScreen = document.getElementById("log-screen")

// open devtools
mousetrap.bind(['command+alt+i', 'ctrl+alt+k'], function() {
  logger.info('view@log@open-devtools')
  remote.getCurrentWebContents().openDevTools()
})

function addNewLog(text) {
  const logJson = JSON.parse(text)
  const logDom = document.createElement('p')
  const levelDom = document.createElement('span')
  const timeDom = document.createElement('span')
  const msgDom = document.createElement('span')

  levelDom.innerHTML = logJson.level
  if (logJson.level === 'info') {
    levelDom.classList.add('text-info')
  } else if (logJson.level === 'error') {
    levelDom.classList.add('text-danger')
  }

  timeDom.innerHTML = logJson.timestamp
  timeDom.classList.add('ml-2')

  msgDom.innerHTML = logJson.message
  msgDom.classList.add('ml-2')

  logDom.classList.add('log')
  logDom.classList.add('card-text')
  logDom.appendChild(levelDom)
  logDom.appendChild(timeDom)
  logDom.appendChild(msgDom)

  logScreen.appendChild(logDom)
}

function logScrollButtom() {
  logScreen.scrollTop = logScreen.scrollHeight
}

document.addEventListener("DOMContentLoaded", () => {
  logger.info('view@log@DOMContentLoaded')

  const logStream = new tail.Tail(logFile)

  logStream.on("line", function(data) {
    addNewLog(data)
    logScrollButtom()
  })

  logStream.on("error", function(error) {
    console.log(`ERROR: ${error}`)
  })
})
