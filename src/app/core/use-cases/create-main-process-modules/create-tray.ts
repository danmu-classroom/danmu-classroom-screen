import { BrowserWindow, nativeImage, Tray } from 'electron';
import icon from '../../../../../build-resources/icon.png?asset';

export function createTray(dashboardWindow: BrowserWindow) {
  const tray = new Tray(nativeImage.createFromPath(icon).resize({ height: 32, width: 32 }));
  tray.setToolTip('danmu-classroom');
  tray.on('click', () => dashboardWindow.show());
  return tray;
}
