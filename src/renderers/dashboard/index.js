const path = require('path');
const url = require('url');
const { ipcRenderer, remote } = require('electron');
const log = require('electron-log');

const { App } = remote.require('./app');
const danmuWin = remote.getGlobal('windows').danmu;
const displays = remote.getGlobal('displays');
let roomKey = '';
let roomToken = '';

function displayRadioHTML(order, id) {
  const radio = `
  <div class="form-check form-check-inline">
    <input class="form-check-input" type="radio" name="config-danmu-display" id="config-danmu-display${order}" value="${id}">
    <label class="form-check-label" for="config-danmu-display${order}">${order}</label>
  </div>
  `;
  return radio;
}

function sendTestDanmu() {
  const message = {
    content: $('#test-danmu').val(),
  };
  $('#test-danmu').val(null);
  return message;
}

function updateRoomCreater() {
  const api = url.resolve(App.config.upstream, `api/rooms/${roomKey}`);
  const params = {
    email: $('#user-email').val(),
    password: $('#user-password').val(),
    auth_token: roomToken,
  };
  const options = {
    method: 'PATCH',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  };

  // POST https://danmu-classroom.herokuapp.com/api/rooms/${roomKey}
  fetch(api, options)
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res);
    })
    .then((body) => {
      $('#user-login').text('登入成功');
      $('#user-login').addClass('disabled');
    })
    .catch((error) => {
      $('#user-password').val(null);
      error
        .json()
        .then((message) =>
          App.log.error(`app@dashboard login error ${JSON.stringify(message)}`)
        );
    });
}

function sendDanmuConfigs() {
  const fontFamily = $('#config-font-family').val();
  const fontSize = $('#config-font-size').val();
  const danmuSpeed = $('#config-danmu-speed').val();
  const danmuConfig = {
    fontSize,
    fontFamily,
    speed: danmuSpeed,
  };
  $('body').css('font-family', fontFamily);
  danmuWin.webContents.send('danmu-config', danmuConfig);
}

// DOM linsteners
window.addEventListener('beforeunload', () => ipcRenderer.send('quit-app'));
$('#log-btn').on('click', () =>
  remote.shell.showItemInFolder(App.log.transports.file.findLogPath())
);
$('#send-btn').on('click', () =>
  danmuWin.webContents.send('danmu', sendTestDanmu())
);
$('#user-login').on('click', () => updateRoomCreater());
$('input[name^=config-], select[name^=config-]').change(() =>
  sendDanmuConfigs()
);

$(document).ready(() => {
  // setup radios for displays
  const displaysForm = $('#displays-form');
  displays.forEach((display, index) => {
    displaysForm.append(displayRadioHTML(index + 1, display.id));
  });
  $('#config-danmu-display1').prop('checked', true);
  // change display
  $('input[name=config-danmu-display]').change(() => {
    const danmuDisplay = displays.find((display, index) => {
      return display.id == $('input[name=config-danmu-display]:checked').val();
    });
    danmuWin.setBounds(danmuDisplay.bounds);
  });

  ipcRenderer.send('dashboard-ready');
});

// IPC listeners
ipcRenderer.on('room-key', (event, key) => {
  // Update room key and token
  roomKey = remote.getGlobal('roomKey');
  roomToken = remote.getGlobal('roomToken');
  $('#key').text(roomKey);
});
