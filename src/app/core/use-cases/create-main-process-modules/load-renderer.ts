import { BrowserWindow } from 'electron';
import { join } from 'path';

export const preloadPath = join(__dirname, '../preload/index.js');

// electron-vite serves renderers from a dev server in `yarn dev`, and from files once built.
export function loadRenderer(window: BrowserWindow, page: 'canvas' | 'dashboard') {
  const devServerUrl = process.env.ELECTRON_RENDERER_URL;
  if (devServerUrl) return window.loadURL(`${devServerUrl}/${page}.html`);

  return window.loadFile(join(__dirname, `../renderer/${page}.html`));
}
