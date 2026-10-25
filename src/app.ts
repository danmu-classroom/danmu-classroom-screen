import {
  app,
  BrowserWindow,
  Display,
  globalShortcut,
  ipcMain,
  screen,
  shell,
  Tray,
} from 'electron';
import logger from 'electron-log/main';
import { DanmuConfig, Room } from './app/core/models';
import {
  createCanvasWindow,
  createDashboardWindow,
  createTray,
} from './app/core/use-cases/create-main-process-modules';
import { appConfig, env } from './app/core/use-cases/init-app';
import { pollDanmus, UpstreamClient } from './app/core/use-cases/upstream';

const DANMU_POLLING_INTERVAL_MS = 900;

export class App {
  app = app;
  env = env;

  private canvasWindow: BrowserWindow;
  private config = appConfig;
  private dashboardWindow: BrowserWindow;
  private displays: Display[];
  private room: Room | null = null;
  private stopPollingDanmus: (() => void) | null = null;
  private tray: Tray;
  private upstream = new UpstreamClient(appConfig);

  run() {
    logger.info(
      `app @ is running at ${this.env} mode, upstream ${this.config.upstream}`,
    );

    // Main process event listeners
    this.app
      .whenReady()
      .then(async () => {
        // Handlers first, so renderers can ask for config/room as soon as they load
        this.registerIpcMainHandlers();
        await this.createMainProcessModules();
        this.displays = screen.getAllDisplays();
        this.registerGlobalShortcuts();

        this.room = await this.upstream.createRoom();
        logger.info('app @ room created');
        this.canvasWindow.webContents.send('app:roomCreated', this.room);
        this.dashboardWindow.webContents.send('app:roomCreated', this.room);
        this.startPollingDanmus(this.room);
      })
      .catch((error: unknown) => logger.error('app @ init failed:', error));

    this.app.on('activate', () => this.dashboardWindow?.show());

    this.app.on('window-all-closed', () => {
      if (process.platform === 'darwin') return;

      app.quit();
    });

    this.app.on('will-quit', () => this.stopPollingDanmus?.());
  }

  private async createMainProcessModules() {
    [this.canvasWindow, this.dashboardWindow] = await Promise.all([
      createCanvasWindow(),
      createDashboardWindow(),
    ]);
    logger.info('app @ canvas and dashboard windows created');
    this.tray = createTray(this.dashboardWindow);
  }

  // eslint-disable-next-line class-methods-use-this
  private openLogDir() {
    shell.showItemInFolder(logger.transports.file.getFile().path);
  }

  private registerGlobalShortcuts() {
    // Global shortcuts
    globalShortcut.register('CmdOrCtrl+Alt+I', () =>
      this.dashboardWindow.webContents.openDevTools(),
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

    ipcMain.on(
      'app:log',
      (_event, level: 'info' | 'error', ...params: unknown[]) =>
        logger[level](...params),
    );

    ipcMain.on('app:openLogDir', () => this.openLogDir());

    ipcMain.on('dashboard:sendTestDanmu', (_event, content: string) => {
      this.canvasWindow.webContents.send('app:testDanmu', content);
    });

    ipcMain.on(
      'dashboard:updateDanmuConfig',
      (_event, danmuConfig: DanmuConfig) => {
        this.config = { ...this.config, danmu: danmuConfig };
        this.canvasWindow.webContents.send(
          'app:danmuConfigUpdated',
          danmuConfig,
        );
      },
    );

    ipcMain.on('dashboard:changeCanvasDisplay', (_event, displayId: number) => {
      const display = this.displays.find((it) => it.id === displayId);
      if (display == null) return;

      this.canvasWindow.setBounds(display.bounds);
    });

    ipcMain.handle('app:getConfig', () => this.config);

    ipcMain.handle('app:getRoom', () => this.room);

    ipcMain.handle('app:getDisplays', () => {
      this.displays ||= screen.getAllDisplays();
      return this.displays;
    });
  }

  private startPollingDanmus(room: Room) {
    this.stopPollingDanmus = pollDanmus({
      intervalMs: DANMU_POLLING_INTERVAL_MS,
      onDanmus: (danmus) =>
        this.canvasWindow.webContents.send('app:danmus', danmus),
      onError: (error) => logger.error('app @ get danmus error:', error),
      popDanmus: () => this.upstream.popDanmus(room),
    });
  }
}
