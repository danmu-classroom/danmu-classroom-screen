import { BrowserWindow } from 'electron';
import logger from 'electron-log';
import url from 'url';

export const canvasWindow = new BrowserWindow({
  frame: false,
  titleBarStyle: 'customButtonsOnHover',
  transparent: true,
  webPreferences: {
    nodeIntegration: true,
  },
});

canvasWindow
  .loadURL(
    url.format({
      // Path of __dirname will be build after yarn build:main
      // Point to builded canvas html: build/renderers/canvas.html
      pathname: `${__dirname}/renderers/canvas.html`,
      protocol: 'file:',
      slashes: true,
    })
  )
  .then(() => {
    logger.info('app @ canvas window created');
    canvasWindow.maximize();
    canvasWindow.setIgnoreMouseEvents(true);
    canvasWindow.setAlwaysOnTop(true);
  })
  .catch((e) =>
    logger.error(`app @ canvas window create failed: ${JSON.stringify(e)}`)
  );
