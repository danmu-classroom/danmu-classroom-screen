import type { DanmuApi } from '../../../../preload';

declare global {
  interface Window {
    danmu: DanmuApi;
  }
}
