import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadAppConfig() {
  vi.resetModules();
  const { appConfig } = await import('./load-app-config');
  return appConfig;
}

describe('appConfig', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('uses the production server by default', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect((await loadAppConfig()).upstream).toBe(
      'https://danmu-classroom.herokuapp.com',
    );
  });

  it('uses the local server dev container in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DANMU_UPSTREAM', '');

    expect((await loadAppConfig()).upstream).toBe('http://localhost:3001');
  });

  it('lets DANMU_UPSTREAM override the server in development only', async () => {
    vi.stubEnv('DANMU_UPSTREAM', 'http://host.docker.internal:3001');

    vi.stubEnv('NODE_ENV', 'development');
    expect((await loadAppConfig()).upstream).toBe(
      'http://host.docker.internal:3001',
    );

    vi.stubEnv('NODE_ENV', 'production');
    expect((await loadAppConfig()).upstream).toBe(
      'https://danmu-classroom.herokuapp.com',
    );
  });
});
