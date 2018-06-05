/// <reference types="node" />
import * as Http from 'http';
export interface Http_ServerWithShutdown extends Http.Server {
    withShutdown(): Http_ServerWithShutdown;
    shutdown(listener?: () => void): void;
}
export declare class Server {
    private static _singleton;
    private static _handler(request, response);
    static readonly singleton: Server;
    protected _httpserver: Http_ServerWithShutdown;
    readonly httpserver: Http_ServerWithShutdown;
    protected constructor(port_?: number, host_?: string);
    dispose(): void;
}
