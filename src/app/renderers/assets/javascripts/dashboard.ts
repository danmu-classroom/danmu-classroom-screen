import { Application } from '@hotwired/stimulus';
import { DashboardController } from './controllers/dashboard-controller';

window.addEventListener('beforeunload', () => window.danmu.exit());

window.danmu
  .getConfig()
  .then((appConfig) => {
    const dom = document.querySelector('[data-controller="dashboard"]');
    dom.setAttribute('data-dashboard-app-config-value', JSON.stringify(appConfig));
  })
  .then(() => {
    const application = Application.start();
    application.register('dashboard', DashboardController);
  })
  .catch((error: unknown) => window.danmu.log('error', 'renderer @ dashboard init failed', error));
