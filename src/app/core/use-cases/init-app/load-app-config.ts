import { Env, AppConfig } from '../../models';
import developmentConfig from '../../../../config/development.json';
import productionConfig from '../../../../config/production.json';
import { env } from './load-env';

function loadAppConfig(environment: Env): AppConfig {
  if (environment === Env.production) return productionConfig;
  if (environment === Env.development) return developmentConfig;
  return null;
}

export const appConfig = loadAppConfig(env);
