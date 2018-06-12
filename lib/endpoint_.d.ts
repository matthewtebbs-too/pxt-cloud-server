/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { PrivateAPI } from './api_';
export declare type Callback<T> = (error: Error | null, reply?: T) => void;
export declare abstract class Endpoint extends EventEmitter implements API.EventAPI {
    static userId: typeof Endpoint.connectId;
    static connectId(socket?: SocketIO.Socket): string;
    protected static _extractSocketFromArgs(args: any[]): [any[], any];
    protected static _fulfillReceivedEvent<T>(promise: Promise<T>, cb: Callback<T>): void;
    protected abstract _debug: any;
    private _privateAPI;
    private _redisClient;
    protected readonly privateAPI: PrivateAPI;
    protected readonly redisClient: Redis.RedisClient;
    constructor(privateAPI: PrivateAPI, redisClient: Redis.RedisClient, socketServer: SocketIO.Server, nsp?: string);
    dispose(): void;
    protected _notifyEvent(event: string, ...args: any[]): boolean;
    protected _broadcastNotifyEvent(event: string, ...args_: any[]): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
    protected _onClientDisconnect(socket: SocketIO.Socket): void;
}
