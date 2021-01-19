import { Display } from 'electron/common';
import { ipcRenderer } from 'electron/renderer';
import { Controller } from 'stimulus';
import logger from 'electron-log';
import { AppConfig, Room } from '../../../../core/models';

export class DashboardController extends Controller {
  static targets = [
    'roomKey',
    'testDanmuInput',
    'fontFamilySelect',
    'fontSizeInput',
    'speedInput',
    'displaysInputContainer',
  ];
  static values = {
    appConfig: Object,
    canvasWindowId: Number,
    room: Object,
  };

  appConfigValue: AppConfig;
  canvasWindowIdValue: number;
  displaysInputContainerTarget: HTMLElement;
  fontFamilySelectTarget: HTMLSelectElement;
  fontSizeInputTarget: HTMLInputElement;
  roomKeyTarget: HTMLElement;
  roomValue: Room;
  speedInputTarget: HTMLInputElement;
  testDanmuInputTarget: HTMLInputElement;

  // eslint-disable-next-line class-methods-use-this
  changeCanvasDisplay() {
    const input = document.querySelector<HTMLInputElement>(
      'input[name=config-danmu-display]:checked'
    );
    const displayId = Number(input.value);
    ipcRenderer.send('dashboard:changeCanvasDisplay', displayId);
  }

  connect() {
    ipcRenderer.on('app:roomCreated', (_event, newRoom: Room) => {
      this.roomValue = newRoom;
      this.roomKeyTarget.innerText = newRoom.key;
    });

    ipcRenderer
      .invoke('app:getDisplays')
      .then((displays: Display[]) => this.renderDisplayRadios(displays))
      .catch((error) =>
        logger.error(
          `renderer @ dashboard get displays error: ${JSON.stringify(error)}`
        )
      );
  }

  // eslint-disable-next-line class-methods-use-this
  openLogDir() {
    ipcRenderer.send('app:openLogDir');
  }

  sendTestDanmu() {
    const testDanmu = this.testDanmuInputTarget.value;
    if (testDanmu == null) return;

    ipcRenderer.sendTo(
      this.canvasWindowIdValue,
      'dashboard:sendTestDanmu',
      testDanmu
    );
    this.testDanmuInputTarget.value = null;
  }

  updateDanmuConfig() {
    const fontFamily = this.fontFamilySelectTarget.value;
    const fontSize = Number(this.fontSizeInputTarget.value);
    const speed = Number(this.speedInputTarget.value);

    const danmu = {
      ...this.appConfigValue.danmu,
      fontFamily,
      fontSize,
      speed,
    };

    this.appConfigValue = {
      ...this.appConfigValue,
      danmu,
    };

    ipcRenderer.sendTo(
      this.canvasWindowIdValue,
      'dashboard:updateDanmuConfig',
      danmu
    );
    ipcRenderer.send('dashboard:updateDanmuConfig', danmu);
    logger.info(danmu);
  }

  private renderDisplayRadios(displays: Display[]) {
    this.displaysInputContainerTarget.innerHTML = '';
    // TODO: Generate input radios html
    const displayRadios = displays.map((display, index) => {
      const div = document.createElement('div');
      div.classList.add('form-check');
      div.classList.add('form-check-inline');

      const input = document.createElement('input');
      const inputId = `config-danmu-display-${display.id}`;
      input.classList.add('form-check-input');
      input.type = 'radio';
      input.name = 'config-danmu-display';
      input.value = display.id.toString();
      input.id = inputId;
      input.setAttribute(
        'data-action',
        'change->dashboard#changeCanvasDisplay'
      );

      const label = document.createElement('label');
      label.classList.add('form-check-label');
      label.setAttribute('for', inputId);
      label.innerText = `${index + 1} 號螢幕
       ${display.size.width} X ${display.size.height}`;

      div.appendChild(input);
      div.appendChild(label);
      return div;
    });

    displayRadios.forEach((displayRadio) =>
      this.displaysInputContainerTarget.appendChild(displayRadio)
    );
  }
}
