import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint_';
import { SocketServerAPI } from './socket.server';
import * as API from './api';
export declare class WorldEndpoint extends Endpoint implements API.WorldAPI {
    constructor(publicAPI: API.PublicAPI, redisAPI: RedisAPI, socketServerAPI: SocketServerAPI);
}
