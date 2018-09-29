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
  ipcRenderer.send('ask-for-room-key') // ask room key
  // init danmu
  addDanmu({
    content: 'Danmu Classroom launched.'
  })
})

// IPC listener
ipcRenderer.on('paint-danmu', (event, message) => {
  addDanmu(message) // paint danmu
  logger.info(`app@danmu painted: ${JSON.stringify(message)}`)
})
ipcRenderer.on('update-room-key', (event, key) => $('#key').text(key)) // update key
ipcRenderer.on('change-config', (event, message) => { // change config
  config.danmu = message.danmu
  config.track = message.track
  $('.danmu').css(message.danmu)
  tracks.css(message.track)
})
