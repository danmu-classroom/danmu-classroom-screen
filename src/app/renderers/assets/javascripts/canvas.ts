import { ipcRenderer } from 'electron';
import logger from 'electron-log';
import { Application } from 'stimulus';
import { AppConfig } from '../../../core/models';
import { CanvasController } from './controllers/canvas-controller';

async function init() {
  const appConfig = (await ipcRenderer.invoke('app:getConfig')) as AppConfig;
  return appConfig;
}

init()
  .then((appConfig) => {
    const dom = document.querySelector('[data-controller="canvas"]');
    dom.setAttribute('data-canvas-app-config-value', JSON.stringify(appConfig));
  })
  .then(() => {
    const application = Application.start();
    application.register('canvas', CanvasController);
  })
  .catch((error) =>
    logger.error(`renderer @ canvas init failed ${JSON.stringify(error)}`)
  );
