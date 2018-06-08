import { WorldAPI } from './api.world';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';
export { WorldAPI } from './api.world';
export declare class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI);
}
