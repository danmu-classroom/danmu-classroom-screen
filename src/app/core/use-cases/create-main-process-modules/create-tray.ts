import { nativeImage, Tray } from 'electron';
import { dashboardWindow } from './create-dashboard-window';

export const tray = new Tray(
  nativeImage.createFromPath('/public/img/icon.png').resize({
    height: 32,
    width: 32,
  })
);
tray.setToolTip('danmu-classroom');
tray.on('click', () => dashboardWindow.show());
