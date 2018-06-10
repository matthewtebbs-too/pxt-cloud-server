import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { Endpoint } from './endpoint_';
export declare class WorldEndpoint extends Endpoint implements API.WorldAPI {
    constructor(publicAPI: API.PublicAPI, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
}
