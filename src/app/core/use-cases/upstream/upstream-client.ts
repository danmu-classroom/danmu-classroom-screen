import { AppConfig, Danmu, Room } from '../../models';

// HTTP client for danmu-classroom-server, used from the main process only
// (renderers are sandboxed and have no network access of their own).
export class UpstreamClient {
  constructor(private readonly config: Pick<AppConfig, 'upstream'>) {}

  async createRoom(): Promise<Room> {
    const response = await fetch(new URL('api/rooms', this.config.upstream), {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`create room failed: HTTP ${response.status}`);
    return (await response.json()) as Room;
  }

  async popDanmus(room: Room): Promise<Danmu[]> {
    const url = new URL(`api/rooms/${room.key}/danmus`, this.config.upstream);
    url.searchParams.append('auth_token', room.auth_token);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`get danmus failed: HTTP ${response.status}`);
    return (await response.json()) as Danmu[];
  }
}
