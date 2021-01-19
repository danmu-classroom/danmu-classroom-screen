import fetch from 'node-fetch';
import logger from 'electron-log';
import { Room } from '../../models';
import { appConfig } from '../init-app';

const endpoint = new URL('api/rooms', appConfig.upstream);

async function createRoom() {
  return fetch(endpoint, { method: 'POST' })
    .then<Room>((response) => response.json())
    .then((room) => {
      logger.info('app @ room created');
      return room;
    });
}

export { createRoom };
