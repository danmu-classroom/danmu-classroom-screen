import {
  app,
  BrowserWindow,
  Display,
  ipcMain,
  Tray,
  screen,
  shell,
} from 'electron';
import logger from 'electron-log';
import { globalShortcut } from 'electron/main';
import { DanmuConfig, Room } from './app/core/models';
import { createRoom } from './app/core/use-cases/create-room';
import { appConfig, env } from './app/core/use-cases/init-app';

export class App {
  app = app;
  env = env;

  private canvasWindow: BrowserWindow;
  private config = appConfig;
  private dashboardWindow: BrowserWindow;
  private displays: Display[];
  private room: Room;
  private tray: Tray;

  run() {
    logger.info(`app @ is running at ${this.env} mode`);

    // Main process event listeners
    this.app
      .whenReady()
      .then(() => this.createMainProcessModules())
      .then(() => {
        this.displays = screen.getAllDisplays();
        this.registerGlobalShortcuts();
        this.registerIpcMainHandlers();
      })
      .then(() => createRoom())
      .then((room) => {
        this.room = room;
        this.canvasWindow.webContents.send('app:roomCreated', this.room);
        this.dashboardWindow.webContents.send('app:roomCreated', this.room);
      })
      .catch((error) =>
        logger.error(`app @ init failed: ${JSON.stringify(error)}`)
      );

    this.app.on('activate', () => this.dashboardWindow.show());

    this.app.on('window-all-closed', () => {
      if (process.platform === 'darwin') return;

      app.quit();
    });
  }

  private async createMainProcessModules() {
    const { canvasWindow, dashboardWindow, tray } = await import(
      './app/core/use-cases/create-main-process-modules'
    );
    this.canvasWindow = canvasWindow;
    this.dashboardWindow = dashboardWindow;
    this.tray = tray;
  }

  // eslint-disable-next-line class-methods-use-this
  private openLogDir() {
    shell.showItemInFolder(logger.transports.file.getFile().path);
  }

  private registerGlobalShortcuts() {
    // Global shortcuts
    globalShortcut.register('CmdOrCtrl+Alt+I', () =>
      this.dashboardWindow.webContents.openDevTools()
    );

    globalShortcut.register('CmdOrCtrl+Alt+L', () => this.openLogDir());
  }

  private registerIpcMainHandlers() {
    ipcMain.on('app:exit', () => {
      this.canvasWindow.destroy();
      this.dashboardWindow.destroy();
      this.tray.destroy();
      // Send before-quit event
      // Quit event order: before-quit > will-quit > quit
      app.quit();
    });

    ipcMain.on('app:openLogDir', () => this.openLogDir());

    ipcMain.on(
      'dashboard:updateDanmuConfig',
      (_event, danmuConfig: DanmuConfig) => {
        this.config.danmu = danmuConfig;
      }
    );

    ipcMain.on('dashboard:changeCanvasDisplay', (_event, displayId: number) => {
      const display = this.displays.find((it) => it.id === displayId);
      if (display == null) return;

      this.canvasWindow.setBounds(display.bounds);
    });

    ipcMain.handle('app:getConfig', () => {
      const result = this.config;
      return result;
    });

    ipcMain.handle(
      'app:getCanvasWindowWebContentsId',
      () => this.canvasWindow.id
    );

    ipcMain.handle(
      'app:getDashboardWindowWebContentsId',
      () => this.dashboardWindow.id
    );

    ipcMain.handle('app:getDisplays', () => {
      this.displays ||= screen.getAllDisplays();
      return this.displays;
    });
  }
}
