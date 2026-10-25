import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { Display } from 'electron';
import type { AppConfig, Danmu, DanmuConfig, Room } from './app/core/models';

function subscribe<T>(channel: string, callback: (payload: T) => void) {
  const listener = (_event: IpcRendererEvent, payload: T) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

// The only bridge between the sandboxed renderers and the main process.
const danmuApi = {
  changeCanvasDisplay: (displayId: number) =>
    ipcRenderer.send('dashboard:changeCanvasDisplay', displayId),
  exit: () => ipcRenderer.send('app:exit'),
  getConfig: () => ipcRenderer.invoke('app:getConfig') as Promise<AppConfig>,
  getDisplays: () =>
    ipcRenderer.invoke('app:getDisplays') as Promise<Display[]>,
  getRoom: () => ipcRenderer.invoke('app:getRoom') as Promise<Room | null>,
  log: (level: 'info' | 'error', ...params: unknown[]) =>
    ipcRenderer.send('app:log', level, ...params),
  onDanmuConfigUpdated: (callback: (danmu: DanmuConfig) => void) =>
    subscribe('app:danmuConfigUpdated', callback),
  onDanmus: (callback: (danmus: Danmu[]) => void) =>
    subscribe('app:danmus', callback),
  onRoomCreated: (callback: (room: Room) => void) =>
    subscribe('app:roomCreated', callback),
  onTestDanmu: (callback: (content: string) => void) =>
    subscribe('app:testDanmu', callback),
  openLogDir: () => ipcRenderer.send('app:openLogDir'),
  sendTestDanmu: (content: string) =>
    ipcRenderer.send('dashboard:sendTestDanmu', content),
  updateDanmuConfig: (danmu: DanmuConfig) =>
    ipcRenderer.send('dashboard:updateDanmuConfig', danmu),
};

export type DanmuApi = typeof danmuApi;

contextBridge.exposeInMainWorld('danmu', danmuApi);
