/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
export declare type Callback<T> = (error: Error | null, reply?: T) => void;
export declare class Endpoint extends EventEmitter implements API.EventAPI {
    static userId: typeof Endpoint.connectId;
    static connectId(socket?: SocketIO.Socket): string;
    protected static _extractSocketFromArgs(args: any[]): [any[], any];
    protected static _onPromisedEvent<T>(promise: Promise<T>, cb: Callback<T>): void;
    private _publicAPI;
    private _redisClient;
    protected readonly publicAPI: API.PublicAPI;
    protected readonly redisClient: Redis.RedisClient;
    constructor(publicAPI: API.PublicAPI, redisClient: Redis.RedisClient, socketServer: SocketIO.Server, nsp?: string);
    protected _broadcastEvent(event: string, ...args_: any[]): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
    protected _onClientDisconnect(socket: SocketIO.Socket): void;
}
