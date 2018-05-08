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
const createRoomUrl = url.resolve(danmuServer, 'rooms')

async function initNgrok(portNumber) {
  const ngrokUrl = await ngrok.connect(portNumber)

  logger.info(`process@create-room@ngrok-connected tunnel: ${ngrokUrl}`)

  return ngrokUrl
}

async function initRoom(webhook) {
  const body = {
    room: {
      webhook: webhook
    }
  }
  const response = await fetch(createRoomUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: jsonHeader
  })
  const json = await response.json()

  logger.info(`process@create-room@room-created key: ${json.key}`)

  return json
}

async function createRoom(portNumber, webhookPath) {
  const tunnel = await initNgrok(portNumber)
  const webhook = url.resolve(tunnel, webhookPath)
  const room = await initRoom(webhook)
  return {
    webhook: webhook,
    key: room.key,
  }
}

createRoom(localServer.port, localServer.webhookPath).then(
  (room) => { // task done
    process.send({
      status: 'ok',
      webhook: room.webhook,
      key: room.key
    })
  },
  (err) => { // catch error
    process.send({
      status: 'error',
      error: err
    })
    logger.error(`process@create-room@error ${err}`)
  })

// kill process
process.on('SIGTERM', () => {
  logger.info('process@create-room@SIGTERM')
  process.exit(0)
})
