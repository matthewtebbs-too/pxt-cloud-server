/// <reference types="node" />
import { EventEmitter } from 'events';
import * as SocketIO from 'socket.io';
import { RedisAPI } from './client.redis';
export declare class Endpoint extends EventEmitter {
    static connectId(socket?: SocketIO.Socket): string;
    private _io;
    private _redisAPI;
    protected readonly io: SocketIO.Namespace | null;
    readonly redisAPI: RedisAPI;
    constructor(server: any, redisAPI: RedisAPI, nsp?: string);
    protected _attach(io: SocketIO.Namespace): void;
    protected _onConnection(socket: SocketIO.Socket): void;
    protected _onDisconnection(socket: SocketIO.Socket): void;
}
