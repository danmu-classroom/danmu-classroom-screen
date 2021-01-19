import { ipcRenderer } from 'electron/renderer';
import { Controller } from 'stimulus';
import logger from 'electron-log';
import { AppConfig, Danmu, DanmuConfig, Room } from '../../../../core/models';
import { CanvasDanmu } from '../models';

export class CanvasController extends Controller {
  static targets = ['roomKey', 'canvas'];
  static values = {
    appConfig: Object,
    room: Object,
  };

  appConfigValue: AppConfig;
  canvasContext: CanvasRenderingContext2D;
  canvasDanmus: CanvasDanmu[] = [];
  canvasTarget: HTMLCanvasElement;
  roomKeyTarget: HTMLElement;
  roomValue: Room;

  get api() {
    const api = new URL(
      `api/rooms/${this.roomValue.key}/danmus`,
      this.appConfigValue.upstream
    );
    api.searchParams.append('auth_token', this.roomValue.auth_token);
    return api;
  }

  connect() {
    this.canvasContext = this.canvasTarget.getContext('2d');

    ipcRenderer.on('app:roomCreated', (_event, newRoom: Room) => {
      this.roomValue = newRoom;
      this.roomKeyTarget.innerText = newRoom.key;
    });

    ipcRenderer.on('dashboard:sendTestDanmu', (_event, testDanmu: string) =>
      this.addCanvasDanmu(testDanmu)
    );

    ipcRenderer.on(
      'dashboard:updateDanmuConfig',
      (_event, danmu: DanmuConfig) => {
        this.appConfigValue = {
          ...this.appConfigValue,
          danmu,
        };
      }
    );

    this.poolingDanmus();
    window.requestAnimationFrame(() => this.draw());
  }

  resize() {
    this.canvasTarget.width = window.innerWidth;
    this.canvasTarget.height = window.innerHeight;
  }

  private addCanvasDanmu(content: string) {
    const canvasDanmu: CanvasDanmu = {
      content,
      initTime: Date.now(),
      width: this.canvasContext.measureText(content).width,
      y: Math.floor(Math.random() * this.canvasContext.canvas.height),
    };
    this.canvasDanmus.push(canvasDanmu);
  }

  private draw() {
    const now = Date.now();

    // Clear canvas and apply config to canvas
    this.canvasContext.clearRect(
      0,
      0,
      this.canvasContext.canvas.width,
      this.canvasContext.canvas.height
    );
    this.canvasContext.font = `${this.appConfigValue.danmu.fontSize}px ${this.appConfigValue.danmu.fontFamily}`;
    this.canvasContext.fillStyle = this.appConfigValue.danmu.color;
    this.canvasContext.strokeStyle = this.appConfigValue.danmu.strokeColor;
    this.canvasContext.lineWidth = this.appConfigValue.danmu.strokeWidth;

    const inScreenRangedCanvasDanmus = this.canvasDanmus
      // Compute x axis
      .map((canvasDanmu) => {
        const x =
          this.canvasTarget.width -
          (this.canvasTarget.width * (now - canvasDanmu.initTime)) /
            this.appConfigValue.danmu.speed;
        return { canvasDanmu, x };
      })
      // Filter out danmus which is still in screen range
      .filter(({ canvasDanmu, x }) => x + canvasDanmu.width > 0);

    // Draw danmus to canvas
    inScreenRangedCanvasDanmus.forEach(({ canvasDanmu, x }) => {
      this.canvasContext.fillText(canvasDanmu.content, x, canvasDanmu.y);
      this.canvasContext.strokeText(canvasDanmu.content, x, canvasDanmu.y);
    });

    // Remove danmus which is out of screen range
    this.canvasDanmus = inScreenRangedCanvasDanmus.map(
      ({ canvasDanmu }) => canvasDanmu
    );

    // Use recursive to update canvas
    window.requestAnimationFrame(() => this.draw());
  }

  private poolingDanmus() {
    fetch(this.api.toString())
      .then((response) => response.json())
      .then((danmus: Danmu[]) =>
        danmus.forEach((danmu) => this.addCanvasDanmu(danmu.content))
      )
      .catch((error) =>
        logger.error(`renderer @ get danmus error: ${JSON.stringify(error)}`)
      );

    setTimeout(() => this.poolingDanmus(), 900);
  }
}
