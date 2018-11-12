const path = require('path')
const url = require('url')
const fetch = require('node-fetch')
const ngrok = require('ngrok')
const {
  folder,
  server
} = require(path.join(__dirname, '../config'))
const logger = require(path.join(folder.main, 'logger'))

const jsonHeader = {
  'Content-Type': 'application/json; charset=utf-8'
}
let roomKey = null
let roomToken = null
let tunnelURL = null

async function createTunnel(localPort) {
  const ngrokURL = await ngrok.connect(localPort)
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
  // POST https://danmu-classroom.herokuapp.com/api/rooms
  const response = await fetch(url.resolve(server.danmu, 'api/rooms'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: jsonHeader
  })
  const result = await response.json()
  roomToken = result.auth_token
  roomKey = result.key
  logger.info(`tunnel@room created, room key: ${result.key}`)
  return result
}

async function initService(localPort, localPath) {
  const tunnel = await createTunnel(localPort)
  const webhook = url.resolve(tunnel, localPath)
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
  // POST https://danmu-classroom.herokuapp.com/api/rooms/${roomKey}
  const response = await fetch(url.resolve(server.danmu, `api/rooms/${roomKey}`), {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: jsonHeader
  })
  const result = await response.json()
  logger.info("tunnel@room webhook updated")
  return result
}

async function recreateTunnel(localPort) {
  ngrok.disconnect() // disconnect all ngrok service on this computer
  const ngrokURL = await createTunnel(localPort)
  return ngrokURL
}

async function reconnectService(localPort, localPath) {
  const tunnel = await recreateTunnel(localPort)
  const webhook = url.resolve(tunnel, localPath)
  const room = await updateRoom(webhook)
  return room
}

initService(server.local.port, server.local.webhook).then(
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

process.on('message', (message) => {
  // reconnect
  if (message.action == 'reconnect') {
    reconnectService(server.local.port, server.local.webhook).then(
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
