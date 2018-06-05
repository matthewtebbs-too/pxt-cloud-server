/// <reference types="node" />
import * as Http from 'http';
import { WorldAPI } from './api.world';
import { WorldEndpoint } from './endpoint.world';
export interface Http_ServerWithShutdown extends Http.Server {
    withShutdown(): Http_ServerWithShutdown;
    shutdown(listener?: () => void): void;
}
export declare class Server {
    private static _singleton;
    private static _handler;
    static readonly singleton: Server;
    static readonly httpServer: Http_ServerWithShutdown;
    static readonly worldAPI: WorldAPI;
    protected _httpServer: Http_ServerWithShutdown;
    protected _worldEndpoint: WorldEndpoint;
    protected constructor(port_?: number, host_?: string);
    dispose(): void;
}
