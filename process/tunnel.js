const path = require('path')
const url = require('url')
const fetch = require('node-fetch')
const ngrok = require('ngrok')
const {
  paths,
  localServer,
  danmuServer
} = require(path.join(__dirname, '../config'))
const logger = require(path.join(paths.lib, 'logger'))
const jsonHeader = {
  'Content-Type': 'application/json; charset=utf-8'
}

let roomKey = null
let roomToken = null
let tunnelURL = null

async function createTunnel(portNumber) {
  const ngrokURL = await ngrok.connect(portNumber)
  tunnelURL = ngrokURL
  logger.info(`tunnel@tunnel up, url: ${ngrokURL}`)
  return ngrokURL
}

async function createRoom(webhook) {
  const body = {
    room: {
      webhook: webhook
    }
  }
  // POST https://danmu-classroom.herokuapp.com/rooms
  const response = await fetch(url.resolve(danmuServer, 'rooms'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: jsonHeader
  })
  const json = await response.json()
  roomToken = json.auth_token
  roomKey = json.key
  logger.info(`tunnel@room created, room key: ${json.key}`)
  return json
}

async function initService(portNumber, webhookPath) {
  const tunnel = await createTunnel(portNumber)
  const webhook = url.resolve(tunnel, webhookPath)
  const room = await createRoom(webhook)
  return room
}

async function updateRoom(webhook) {
  const body = {
    room: {
      webhook: webhook
    },
    auth_token: roomToken
  }
  // POST https://danmu-classroom.herokuapp.com/rooms/${roomKey}
  const response = await fetch(url.resolve(danmuServer, `rooms/${roomKey}`), {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: jsonHeader
  })
  const json = await response.json()
  logger.info("tunnel@room webhook updated")
  return json
}

async function recreateTunnel(portNumber) {
  ngrok.disconnect() // disconnect all ngrok service on this computer
  const ngrokURL = await createTunnel(portNumber)
  return ngrokURL
}

async function reconnectService(portNumber, webhookPath) {
  const tunnel = await recreateTunnel(portNumber)
  const webhook = url.resolve(tunnel, webhookPath)
  const room = await updateRoom(webhook)
  return room
}

initService(localServer.port, localServer.webhookPath).then(
  (room) => { // task done
    process.send({
      status: 'ok',
      room: room
    })
  },
  (err) => { // catch error
    process.send({
      status: 'error',
      error: err
    })
    logger.error(`tunnel@error: ${err}`)
  })

// reconnect
process.on('message', (message) => {
  if (message.action == 'reconnect') {
    reconnectService(localServer.port, localServer.webhookPath).then(
      (room) => { // task done
        process.send({
          status: 'ok',
          room: room
        })
      },
      (err) => { // catch error
        process.send({
          status: 'error',
          error: err
        })
        logger.error(`tunnel@error: ${err}`)
      })
    logger.info('tunnel@reconnect')
  }
})
// kill process
process.on('SIGTERM', () => {
  logger.info('tunnel@SIGTERM')
  process.exit(0)
})
