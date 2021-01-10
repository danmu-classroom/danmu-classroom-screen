import { BrowserWindow } from 'electron';
import logger from 'electron-log';
import url from 'url';

export const dashboardWindow = new BrowserWindow({
  minHeight: 450,
  minWidth: 450,
  webPreferences: {
    nodeIntegration: true,
  },
});

dashboardWindow
  .loadURL(
    url.format({
      // Path of __dirname will be build after yarn build:main
      // Point to builded canvas html: build/renderers/dashboard.html
      pathname: `${__dirname}/renderers/dashboard.html`,
      protocol: 'file:',
      slashes: true,
    })
  )
  .then(() => {
    logger.info('app @ dashboard window created');
    dashboardWindow.maximize();
  })
  .catch((e) =>
    logger.error(`app @ dashboard window create failed: ${JSON.stringify(e)}`)
  );
