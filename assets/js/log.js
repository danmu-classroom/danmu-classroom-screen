const logFile = path.join(paths.log, 'app.log')
const logStream = new tail.Tail(logFile, {
  useWatchFile: true
})
const logScreen = $("#log-screen")

function addNewLog(text) {
  const logJson = JSON.parse(text)

  const logDom = $("<p></p>")
  const levelDom = $("<span></span>")
  const timeDom = $("<span></span>")
  const msgDom = $("<span></span>")

  logDom.addClass("log")
  logDom.addClass("card-text")

  levelDom.text(logJson.level)
  if (logJson.level === "info") {
    levelDom.addClass("text-info")
  } else if (logJson.level === "error") {
    levelDom.addClass("text-danger")
  }
  levelDom.appendTo(logDom)

  timeDom.text(logJson.timestamp)
  timeDom.addClass("ml-2")
  timeDom.appendTo(logDom)

  msgDom.text(logJson.message)
  msgDom.addClass("ml-2")
  msgDom.appendTo(logDom)

  logDom.appendTo(logScreen)
}


function logScrollButtom() {
  logScreen[0].scrollTop = logScreen[0].scrollHeight
}

$(document).ready(() => {
  logStream.on("line", function(data) {
    addNewLog(data)
    logScrollButtom()
  })
  logStream.on("error", function(error) {
    console.log(`ERROR: ${error}`)
  })

})
