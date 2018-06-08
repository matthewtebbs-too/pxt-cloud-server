
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as SocketIO from 'socket.io';

import { AckCallback, ackHandler } from './api.base';
import { WorldAPI } from './api.world';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';

export { WorldAPI } from './api.world';

const debug = require('debug')('pxt-cloud:endpoint.world');

// tslint:disable-next-line:variable-name
const WorldDBKeys = {
};

export class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI) {
        super(socketServerAPI, redisAPI, 'pxt-cloud.world');
    }
}
