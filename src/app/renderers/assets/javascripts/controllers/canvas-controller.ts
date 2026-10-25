import { Controller } from '@hotwired/stimulus';
import type { AppConfig, Room } from '../../../../core/models';
import { CanvasDanmu } from '../models';

export class CanvasController extends Controller {
  static targets = ['roomKey', 'canvas'];
  static values = {
    appConfig: Object,
    room: Object,
  };

  declare appConfigValue: AppConfig;
  canvasContext: CanvasRenderingContext2D;
  canvasDanmus: CanvasDanmu[] = [];
  declare canvasTarget: HTMLCanvasElement;
  declare roomKeyTarget: HTMLElement;
  declare roomValue: Room;

  connect() {
    this.canvasContext = this.canvasTarget.getContext('2d');

    // The room may have been created before this window finished loading
    void window.danmu.getRoom().then((room) => room && this.showRoom(room));
    window.danmu.onRoomCreated((room) => this.showRoom(room));

    window.danmu.onTestDanmu((testDanmu) => this.addCanvasDanmu(testDanmu));

    window.danmu.onDanmuConfigUpdated((danmu) => {
      this.appConfigValue = {
        ...this.appConfigValue,
        danmu,
      };
    });

    window.danmu.onDanmus((danmus) =>
      danmus.forEach((danmu) => this.addCanvasDanmu(danmu.content)),
    );

    this.resize();
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
      this.canvasContext.canvas.height,
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
      ({ canvasDanmu }) => canvasDanmu,
    );

    // Use recursive to update canvas
    window.requestAnimationFrame(() => this.draw());
  }

  private showRoom(room: Room) {
    this.roomValue = room;
    this.roomKeyTarget.innerText = room.key;
  }
}
