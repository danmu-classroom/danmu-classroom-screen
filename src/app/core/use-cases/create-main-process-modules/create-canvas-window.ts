import { BrowserWindow } from 'electron';
import { loadRenderer, preloadPath } from './load-renderer';

export async function createCanvasWindow() {
  const canvasWindow = new BrowserWindow({
    frame: false,
    titleBarStyle: 'customButtonsOnHover',
    transparent: true,
    webPreferences: { preload: preloadPath },
  });

  await loadRenderer(canvasWindow, 'canvas');
  canvasWindow.maximize();
  canvasWindow.setIgnoreMouseEvents(true);
  canvasWindow.setAlwaysOnTop(true);
  return canvasWindow;
}
