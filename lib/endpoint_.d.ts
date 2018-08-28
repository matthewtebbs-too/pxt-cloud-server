/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
import * as Redlock from 'redlock';
import * as SocketIO from 'socket.io';
import * as API from 'pxt-cloud-api';
export declare type Callback<T> = (error: Error | null, reply?: T) => void;
export declare const EndpointDBKeys: {
    locks: (name: string) => string;
    blob: string;
};
export declare abstract class Endpoint extends EventEmitter implements API.CommonAPI {
    static userId: typeof Endpoint.connectId;
    static connectId(socket?: SocketIO.Socket): string;
    protected static _extractSocketFromArgs(args: any[]): [any[], any];
    protected static _fulfillReceivedEvent<T>(promise: PromiseLike<T>, cb: Callback<T>): void;
    protected static _promiseHandler<T>(resolve: (value?: T) => void, reject: (reason?: any) => void): (error: any, reply: T) => void;
    protected static _binaryPromiseHandler(resolve: (value?: Buffer) => any, reject: any): (error: any, reply: string) => void;
    protected static _binaryarrayPromiseHandler(resolve: (value?: Buffer[]) => any, reject: any): (error: any, reply: string[]) => void;
    readonly off: (event: string | symbol, listener: (...args: any[]) => void) => this;
    protected abstract _debug: any;
    readonly isConnected: boolean;
    private _socketNamespace;
    private _endpoints;
    private _redisClient;
    private _redlock;
    private _redlockLocks;
    protected readonly endpoints: Endpoints;
    protected readonly redisClient: Redis.RedisClient;
    protected readonly redlock: Redlock | null;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server, nsp?: string);
    dispose(): Promise<void>;
    protected _isInitialized(socket?: SocketIO.Socket): any;
    protected _initializeClient(socket?: SocketIO.Socket): Promise<boolean>;
    protected _uninitializeClient(socket?: SocketIO.Socket): Promise<boolean>;
    protected _notifyEvent(event: string, ...args_: any[]): Promise<void>;
    protected _resourceLock(name: string, ttl?: number): Promise<Redlock.Lock | undefined>;
    protected _resourceUnlock(name: string): Promise<Redlock.Lock>;
    protected _onClientConnect(socket: SocketIO.Socket): Promise<void>;
    protected _onClientDisconnect(socket: SocketIO.Socket): Promise<void>;
}
export declare type Endpoints = {
    [E in keyof API.PublicAPI]: (Endpoint & API.PublicAPI[E]) | null;
};
