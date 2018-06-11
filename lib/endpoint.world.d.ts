import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { PrivateAPI } from './api_';
import { Endpoint } from './endpoint_';
export declare class WorldEndpoint extends Endpoint implements API.WorldAPI {
    constructor(privateAPI: PrivateAPI, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
}
