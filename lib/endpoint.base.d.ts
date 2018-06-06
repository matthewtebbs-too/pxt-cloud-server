/// <reference types="node" />
import { EventEmitter } from 'events';
import * as SocketIO from 'socket.io';
export declare class Endpoint extends EventEmitter {
    static connectId(socket?: SocketIO.Socket): string;
    private _io;
    protected readonly io: SocketIO.Namespace | null;
    constructor(server: any, nsp?: string);
    protected _attach(io: SocketIO.Namespace): void;
    protected _onConnection(socket: SocketIO.Socket): void;
    protected _onDisconnection(socket: SocketIO.Socket): void;
}
