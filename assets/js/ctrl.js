$(document).ready(() => {
  logger.info(`${thisFilename}Win@ready`)

  // IPC listener
  ipcRenderer.send('ask-for-key') // ask key
  logger.info('view@ctrl@ask-for-key')

  const logBtn = $("#log-btn")
  const hideBtn = $("#hide-btn")
  const quitBtn = $("#quit-btn")
  const testBtn = $("#test-btn")
  const examples = $('.example-danmu')
  const tracks = $('.track')

  // Buttons linstener
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
  testBtn.on('click', () => {
    // restart css animation
    // https://css-tricks.com/restart-css-animation/
    examples.removeClass('danmu')
    examples.outerWidth('100%')
    examples.addClass('danmu')
  })

  // Form linstener
  $('input[name^=config-], select[name^=config-]').change(function() {
    let fontFamily = $('select[name="config-font-family"]').val()
    let fontSize = $('input[name="config-font-size"]').val()
    let danmuSpeed = $('input[name="config-danmu-speed"]').val()
    let color = $('input[name="config-color"][type="radio"]:checked').val()
    let trackHeight = $('input[name="config-track-height"]').val()
    let config = {
      danmu: {
        "font-family": fontFamily,
        "font-size": `${fontSize}rem`,
        "animation-duration": `${danmuSpeed}s`,
        "color": `#${color}`
      },
      track: {
        "height": `${trackHeight}px`
      }
    }
    examples.css(config.danmu)
    tracks.css(config.track)
    ipcRenderer.send('change-config', config)
    logger.info(`${thisFilename}Win@config-change config = ${JSON.stringify(config)}`)
  });
})

ipcRenderer.on('key-is', (event, key) => { // update key
  $("#key").text(key)
  logger.info(`${thisFilename}Win@key-rendered key: ${key}`)
})
