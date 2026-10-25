import { Controller } from '@hotwired/stimulus';
import type { Display } from 'electron';
import type { AppConfig, Room } from '../../../../core/models';

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
    room: Object,
  };

  declare appConfigValue: AppConfig;
  declare displaysInputContainerTarget: HTMLElement;
  declare fontFamilySelectTarget: HTMLSelectElement;
  declare fontSizeInputTarget: HTMLInputElement;
  declare roomKeyTarget: HTMLElement;
  declare roomValue: Room;
  declare speedInputTarget: HTMLInputElement;
  declare testDanmuInputTarget: HTMLInputElement;

  // eslint-disable-next-line class-methods-use-this
  changeCanvasDisplay() {
    const input = document.querySelector<HTMLInputElement>(
      'input[name=config-danmu-display]:checked',
    );
    const displayId = Number(input.value);
    window.danmu.changeCanvasDisplay(displayId);
  }

  connect() {
    // The room may have been created before this window finished loading
    void window.danmu.getRoom().then((room) => room && this.showRoom(room));
    window.danmu.onRoomCreated((room) => this.showRoom(room));

    window.danmu
      .getDisplays()
      .then((displays) => this.renderDisplayRadios(displays))
      .catch((error: unknown) =>
        window.danmu.log(
          'error',
          'renderer @ dashboard get displays error:',
          error,
        ),
      );
  }

  // eslint-disable-next-line class-methods-use-this
  openLogDir() {
    window.danmu.openLogDir();
  }

  sendTestDanmu() {
    const testDanmu = this.testDanmuInputTarget.value;
    if (testDanmu == null) return;

    window.danmu.sendTestDanmu(testDanmu);
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

    window.danmu.updateDanmuConfig(danmu);
    window.danmu.log('info', danmu);
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
        'change->dashboard#changeCanvasDisplay',
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
      this.displaysInputContainerTarget.appendChild(displayRadio),
    );
  }

  private showRoom(room: Room) {
    this.roomValue = room;
    this.roomKeyTarget.innerText = room.key;
  }
}
