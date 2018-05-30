/// <reference types="socket.io" />
import * as SocketIO from 'socket.io';
export declare abstract class Endpoint {
    private _io;
    protected readonly io: SocketIO.Namespace | null;
    constructor(server: any, nsp?: string);
    protected _attach(io: SocketIO.Namespace): void;
    protected abstract _onConnection(socket: SocketIO.Socket): void;
    protected abstract _onDisconnection(socket: SocketIO.Socket): void;
}
