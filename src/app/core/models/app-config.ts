import { DanmuConfig } from './danmu-config';

export interface AppConfig {
  danmu: DanmuConfig;
  upstream: string;
}
