/// <reference types="node" />
import * as Http from 'http';
export declare class Server {
    private static _singleton;
    private static _handler(request, response);
    static readonly singleton: Server;
    protected _server: Http.Server;
    readonly httpserver: Http.Server;
    protected constructor(port?: number, hostname?: string);
}
