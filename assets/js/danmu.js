let config = {
  danmu: {},
  track: {}
}
const tracks = $('.track')

function addDanmu(message) {
  const danmu = $("<div></div>")
  danmu.addClass("danmu")
  danmu.text(message.content) // NOTE: xss fixed, do not use innerHtml for unsafe input
  danmu.on("animationend", () => danmu.remove()) // danmu animation end then destroy it
  danmu.css(config.danmu)

  // paint danmu to the track which have less danmu
  danmu.appendTo(tracks[lessDanmuTrackID()]) // paint to screen
}

// return the track index of tracks which have less danmu
function lessDanmuTrackID() {
  let minDanmuCounts = tracks[0].children.length
  let theTrackID = 0
  $.each(tracks, function(idx, track) {
    console.log(track.children.length < minDanmuCounts);
    if (track.children.length < minDanmuCounts) {
      minDanmuCounts = track.children.length
      theTrackID = idx
      console.log(minDanmuCounts);
      console.log(theTrackID);
    }
  })
  return theTrackID;
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
  logger.info(`${thisFilename}Win@danmu-painted danmu = ${JSON.stringify(message)}`)
})
ipcRenderer.on('key-is', (event, key) => { // update key
  $("#key").text(key)
  logger.info(`${thisFilename}Win@key-rendered key = ${key}`)
})
ipcRenderer.on('change-config', (event, message) => { // change config
  const danmus = $('.danmu')
  config.danmu = message.danmu
  config.track = message.track
  danmus.css(message.danmu)
  tracks.css(message.track)
  logger.info(`${thisFilename}Win@config-changed config = ${JSON.stringify(message)}`)
})
