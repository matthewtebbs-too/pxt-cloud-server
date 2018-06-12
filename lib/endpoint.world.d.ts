import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { Endpoint, Endpoints } from './endpoint_';
export declare class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug: any;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
}
