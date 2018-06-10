/// <reference types="node" />
import { EventEmitter } from 'events';
import * as SocketIO from 'socket.io';
import { RedisAPI } from './client.redis';
import { SocketServerAPI } from './socket.server';
import * as API from './api';
export interface IEndpointConstructor {
    new (publicAPI: API.PublicAPI, redisAPI: RedisAPI, socketServerAPI: SocketServerAPI, nsp?: string): Endpoint;
}
export declare class Endpoint extends EventEmitter implements API.EventAPI {
    static userId: typeof Endpoint.connectId;
    static connectId(socket?: SocketIO.Socket): string;
    private _publicAPI;
    private _redisAPI;
    protected readonly redisAPI: RedisAPI;
    constructor(publicAPI: API.PublicAPI, redisAPI: RedisAPI, socketServerAPI: SocketServerAPI, nsp?: string);
    protected _broadcastEvent(event: string, ...args: any[]): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
    protected _onClientDisconnect(socket: SocketIO.Socket): void;
}
