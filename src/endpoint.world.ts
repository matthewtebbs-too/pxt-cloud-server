
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as SocketIO from 'socket.io';

import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint_';
import { SocketServerAPI } from './socket.server';

import * as API from './api';

const debug = require('debug')('pxt-cloud:endpoint.world');

// tslint:disable-next-line:variable-name
const WorldDBKeys = {
};

export class WorldEndpoint extends Endpoint implements API.WorldAPI {
    constructor(
        publicAPI: API.PublicAPI,
        redisAPI: RedisAPI,
        socketServerAPI: SocketServerAPI,
    ) {
        super(publicAPI, redisAPI, socketServerAPI, 'pxt-cloud.world');
    }
}
