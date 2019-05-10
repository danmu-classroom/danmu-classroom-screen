const path = require('path')
const url = require('url')
const fetch = require('node-fetch')
const ngrok = require('ngrok')
const { App } = require(path.join(__dirname, '../app.js'))

let roomKey = null
let roomToken = null
let tunnelURL = null

function customBinPath(binPath) {
  if (App.env === "development") {
    return binPath
  }
  return binPath.replace('app.asar', 'app.asar.unpacked')
}

async function createTunnel(port) {
  const ngrokURL = await ngrok.connect({
    addr: port,
    binPath: (binPath) => customBinPath(binPath)
  })
  tunnelURL = ngrokURL
  App.log.info(`tunnel@tunnel up, url: ${ngrokURL}`)
  return ngrokURL
}

async function createRoom(webhook) {
  // POST https://danmu-classroom.herokuapp.com/api/rooms
  const response = await fetch(url.resolve(App.config.upstream, 'api/rooms'), {
    method: 'POST',
    body: JSON.stringify({
      room: { webhook: webhook }
    }),
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
  const result = await response.json()
  roomToken = result.auth_token
  roomKey = result.key
  App.log.info(`tunnel@room created, room key: ${result.key}`)
  return result
}

async function initService(port, webhook) {
  const tunnel = await createTunnel(port)
  const room = await createRoom(url.resolve(tunnel, webhook))
  return room
}

async function updateRoom(webhook) {
  // POST https://danmu-classroom.herokuapp.com/api/rooms/${roomKey}
  const response = await fetch(url.resolve(App.config.upstream, `api/rooms/${roomKey}`), {
    method: 'PATCH',
    body: JSON.stringify({
      room: { webhook: webhook },
      auth_token: roomToken
    }),
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
  const result = await response.json()
  App.log.info("tunnel@room webhook updated")
  return result
}

async function recreateTunnel(port) {
  ngrok.disconnect() // disconnect all ngrok service on this computer
  const ngrokURL = await createTunnel(port)
  return ngrokURL
}

async function reconnectService(port, webhook) {
  const tunnel = await recreateTunnel(port)
  const room = await updateRoom(url.resolve(tunnel, webhook))
  return room
}

initService(App.config.localhost.port, App.config.localhost.webhook).then(
  (room) => {
    // Success
    process.send({ status: 'ok', room: room })
  }, (err) => {
    // Error
    process.send({ status: 'error', error: err })
    App.log.error(`tunnel@error: ${err}`)
  }
)

process.on('message', (message) => {
  // reconnect
  if (message.action == 'reconnect') {
    reconnectService(App.config.localhost.port, App.config.localhost.webhook).then(
      (room) => {
        // Success
        process.send({ status: 'ok', room: room })
        App.log.info('tunnel@reconnect')
      }, (err) => {
        // Error
        process.send({ status: 'error', error: err })
        App.log.error(`tunnel@error: ${err}`)
      }
    )
  }
})

// kill process
process.on('SIGTERM', () => {
  App.log.info('tunnel@SIGTERM')
  process.exit(0)
})
