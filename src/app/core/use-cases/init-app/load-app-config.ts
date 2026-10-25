import { Env, AppConfig } from '../../models';
import developmentConfig from '../../../../config/development.json';
import productionConfig from '../../../../config/production.json';
import { env } from './load-env';

function loadAppConfig(environment: Env): AppConfig {
  if (environment === Env.production) return productionConfig;
  if (environment === Env.development) return developmentConfig;
  return null;
}

// DANMU_UPSTREAM overrides the server URL in development (e.g. from inside a dev container).
function withUpstreamOverride(config: AppConfig): AppConfig {
  const upstream = process.env.DANMU_UPSTREAM;
  if (env !== Env.development || config == null || !upstream) return config;
  return { ...config, upstream };
}

export const appConfig = withUpstreamOverride(loadAppConfig(env));
