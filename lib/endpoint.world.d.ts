/// <reference types="socket.io" />
import { Endpoint } from './endpoint.base';
export declare class WorldEndpoint extends Endpoint {
    constructor(server: any);
    protected _onConnection(socket: SocketIO.Socket): void;
    protected _onDisconnection(socket: SocketIO.Socket): void;
}
