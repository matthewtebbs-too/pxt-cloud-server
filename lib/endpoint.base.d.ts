/// <reference types="socket.io" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { RedisAPI } from './client.redis';
import { SocketServerAPI } from './socket.server';
export declare class Endpoint extends EventEmitter {
    static connectId(socket?: SocketIO.Socket): string;
    private _socketNamespace;
    private _redisAPI;
    protected readonly socketNamespace: SocketIO.Namespace | null;
    protected readonly redisAPI: RedisAPI;
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI, nsp?: string);
    protected _onClientConnect(socket: SocketIO.Socket): void;
    protected _onClientDisconnect(socket: SocketIO.Socket): void;
}
