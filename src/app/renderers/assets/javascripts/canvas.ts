import { Application } from '@hotwired/stimulus';
import { CanvasController } from './controllers/canvas-controller';

window.danmu
  .getConfig()
  .then((appConfig) => {
    const dom = document.querySelector('[data-controller="canvas"]');
    dom.setAttribute('data-canvas-app-config-value', JSON.stringify(appConfig));
  })
  .then(() => {
    const application = Application.start();
    application.register('canvas', CanvasController);
  })
  .catch((error: unknown) => window.danmu.log('error', 'renderer @ canvas init failed', error));
