$(document).ready(() => {
  ipcRenderer.send('ask-for-room-key') // ask key

  const logBtn = $("#log-btn")
  const hideBtn = $("#hide-btn")
  const quitBtn = $("#quit-btn")
  const sendBtn = $("#send-btn")
  const testBtn = $("#test-btn")
  const examples = $('.example-danmu')
  const tracks = $('.track')

  // Buttons linstener
  logBtn.on('click', () => ipcRenderer.send('open-log-win'))
  hideBtn.on('click', () => thisWindow.hide())
  quitBtn.on('click', () => ipcRenderer.send('quit-app'))
  sendBtn.on('click', () => {
    const message = {
      content: $('#test-danmu').val()
    }
    $('#test-danmu').val(null)
    ipcRenderer.send('send-test-danmu', message)
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
  });
})

// IPC listener
ipcRenderer.on('update-room-key', (event, key) => $("#key").text(key)) // update key
