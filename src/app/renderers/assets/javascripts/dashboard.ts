import { ipcRenderer } from 'electron/renderer';
import logger from 'electron-log';
import { Application } from 'stimulus';
import { DashboardController } from './controllers/dashboard-controller';
import { AppConfig } from '../../../core/models';

async function init() {
  const [appConfig, canvasWindowId] = await Promise.all<AppConfig, number>([
    ipcRenderer.invoke('app:getConfig'),
    ipcRenderer.invoke('app:getCanvasWindowWebContentsId'),
  ]);
  return { appConfig, canvasWindowId };
}

window.addEventListener('beforeunload', () => ipcRenderer.send('app:exit'));

init()
  .then(({ appConfig, canvasWindowId }) => {
    const dom = document.querySelector('[data-controller="dashboard"]');
    dom.setAttribute(
      'data-dashboard-app-config-value',
      JSON.stringify(appConfig)
    );
    dom.setAttribute(
      'data-dashboard-canvas-window-id-value',
      JSON.stringify(canvasWindowId)
    );
  })
  .then(() => {
    const application = Application.start();
    application.register('dashboard', DashboardController);
  })
  .catch((error) =>
    logger.error(`renderer @ dashboard init failed ${JSON.stringify(error)}`)
  );
