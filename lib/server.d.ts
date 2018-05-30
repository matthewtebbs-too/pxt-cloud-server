/// <reference types="node" />
import * as Http from 'http';
export declare class Server {
    private static _handler(request, response);
    private _server;
    readonly httpserver: Http.Server;
    constructor(port?: number, hostname?: string);
    protected _onDispose(): void;
}
