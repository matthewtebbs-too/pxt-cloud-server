/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from 'pxt-cloud-api';
export declare type Callback<T> = (error: Error | null, reply?: T) => void;
export declare abstract class Endpoint extends EventEmitter implements API.CommonAPI {
    static userId: typeof Endpoint.connectId;
    static connectId(socket?: SocketIO.Socket): string;
    protected static _extractSocketFromArgs(args: any[]): [any[], any];
    protected static _fulfillReceivedEvent<T>(promise: PromiseLike<T>, cb: Callback<T>): void;
    readonly off: (event: string | symbol, listener: (...args: any[]) => void) => this;
    protected abstract _debug: any;
    readonly isConnected: boolean;
    private _socketNamespace;
    private _endpoints;
    private _redisClient;
    protected readonly endpoints: Endpoints;
    protected readonly redisClient: Redis.RedisClient;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server, nsp?: string);
    dispose(): void;
    protected _notifyEvent(event: string, ...args: any[]): boolean;
    protected _broadcastNotifyEvent(event: string, ...args_: any[]): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
    protected _onClientDisconnect(socket: SocketIO.Socket): void;
}
export declare type Endpoints = {
    [E in keyof API.PublicAPI]: (Endpoint & API.PublicAPI[E]) | null;
};
