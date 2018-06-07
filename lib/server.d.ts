/// <reference types="node" />
/// <reference types="socket.io" />
import * as Http from 'http';
import { WorldAPI } from './api.world';
import { RedisAPI, RedisClient } from './client.redis';
import { WorldEndpoint } from './endpoint.world';
import { SocketServer } from './socket.server';
export interface Http_ServerWithShutdown extends Http.Server {
    withShutdown(): Http_ServerWithShutdown;
    shutdown(listener?: () => void): void;
}
export declare class Server {
    private static _singleton;
    private static _handler;
    static readonly singleton: Server;
    readonly httpServer: Http_ServerWithShutdown | null;
    readonly socketServerAPI: SocketIO.Server | null;
    readonly redisAPI: RedisAPI | null;
    readonly worldAPI: WorldAPI | null;
    protected _httpServer: Http_ServerWithShutdown | null;
    protected _socketServer: SocketServer | null;
    protected _redisClient: RedisClient | null;
    protected _worldEndpoint: WorldEndpoint | null;
    connect(port_?: number, host_?: string): Promise<Server>;
    dispose(): void;
}
