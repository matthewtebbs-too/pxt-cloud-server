/// <reference types="node" />
import * as Http from 'http';
import { WorldAPI } from './api.world';
import { ClientRedis, RedisAPI } from './client.redis';
import { WorldEndpoint } from './endpoint.world';
export interface Http_ServerWithShutdown extends Http.Server {
    withShutdown(): Http_ServerWithShutdown;
    shutdown(listener?: () => void): void;
}
export declare class Server {
    private static _singleton;
    private static _handler;
    static readonly singleton: Server;
    static readonly httpServer: Http_ServerWithShutdown | null;
    static readonly redisAPI: RedisAPI | null;
    static readonly worldAPI: WorldAPI | null;
    protected _httpServer: Http_ServerWithShutdown | null;
    protected _redisClient: ClientRedis | null;
    protected _worldEndpoint: WorldEndpoint | null;
    connect(port_?: number, host_?: string): Promise<void>;
    dispose(): void;
}
