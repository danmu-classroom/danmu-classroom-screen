import { Env } from '../../models';

function loadEnv() {
  if (process.env.NODE_ENV == null) return Env.production;
  if (process.env.NODE_ENV.trim() === 'production') return Env.production;
  if (process.env.NODE_ENV.trim() === 'development') return Env.development;
  return Env.unknown;
}

export const env = loadEnv();
