import { afterEach, describe, expect, it, vi } from 'vitest';
import { Room } from '../../models';
import { UpstreamClient } from './upstream-client';

const room: Room = {
  auth_token: 'token-123',
  auth_token_sent_at: new Date(),
  id: 1,
  key: '2849',
  online: true,
  url: 'http://localhost:3001/api/rooms/2849',
};

function stubFetch(status: number, body: unknown) {
  const fetchMock = vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('UpstreamClient', () => {
  const client = new UpstreamClient({ upstream: 'http://localhost:3001' });

  afterEach(() => vi.unstubAllGlobals());

  it('creates a room with POST /api/rooms', async () => {
    const fetchMock = stubFetch(201, room);

    await expect(client.createRoom()).resolves.toEqual({
      ...room,
      auth_token_sent_at: room.auth_token_sent_at.toISOString(),
    });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('http://localhost:3001/api/rooms'),
      { method: 'POST' },
    );
  });

  it('pops danmus with the room auth token', async () => {
    const fetchMock = stubFetch(200, [
      { content: 'hello', created_at: '2026-10-25T08:03:31.256Z' },
    ]);

    const danmus = await client.popDanmus(room);

    expect(danmus.map((danmu) => danmu.content)).toEqual(['hello']);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        'http://localhost:3001/api/rooms/2849/danmus?auth_token=token-123',
      ),
    );
  });

  it('throws on HTTP errors', async () => {
    stubFetch(401, { error: 'wrong auth_token' });

    await expect(client.popDanmus(room)).rejects.toThrow(
      'get danmus failed: HTTP 401',
    );
  });
});
