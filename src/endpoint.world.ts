
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from './api';
import * as API_ from './api_';

import { Endpoint } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint:world');

// tslint:disable-next-line:variable-name
const WorldDBKeys = {
};

export class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug: any = debug;

    constructor(
        privateAPI: API_.PrivateAPI,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(privateAPI, redisClient, socketServer, 'world');
    }
}
