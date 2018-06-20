
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

/// <reference types='redis.extra' />

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from './api';

import { Endpoint, Endpoints } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint:world');

// tslint:disable-next-line:variable-name
const WorldDBKeys = {
};

export class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug: any = debug;

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(endpoints, redisClient, socketServer, 'world');
    }
}
