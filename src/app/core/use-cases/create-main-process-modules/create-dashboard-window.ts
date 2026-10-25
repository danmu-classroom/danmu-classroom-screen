import { BrowserWindow } from 'electron';
import { loadRenderer, preloadPath } from './load-renderer';

export async function createDashboardWindow() {
  const dashboardWindow = new BrowserWindow({
    minHeight: 450,
    minWidth: 450,
    webPreferences: { preload: preloadPath },
  });

  await loadRenderer(dashboardWindow, 'dashboard');
  dashboardWindow.maximize();
  return dashboardWindow;
}
