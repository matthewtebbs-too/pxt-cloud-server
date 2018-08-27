/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { EventEmitter } from 'events';
import * as Redis from 'redis';
import * as Redlock from 'redlock';
import * as SocketIO from 'socket.io';

import * as API from 'pxt-cloud-api';

const debug = require('debug')('pxt-cloud:endpoint');

export type Callback<T> = (error: Error | null, reply?: T) => void;

// tslint:disable-next-line:variable-name
export const EndpointDBKeys = {
    locks: (name: string) => `locks:${name}`,

    blob: 'blob',
};

export abstract class Endpoint extends EventEmitter implements API.CommonAPI {
    public static userId = Endpoint.connectId;

    public static connectId(socket?: SocketIO.Socket) {
        return socket ? socket.client.id : 'localhost';
    }

    protected static _extractSocketFromArgs(args: any[]): [ any[], any ] {
        let socket;

        if (args.length > 0) {
            const _socket = args[args.length - 1];

            if (undefined === _socket || (typeof _socket === 'object' && 'broadcast' in _socket)) {
                socket = _socket;

                args.pop();
            }
        }

        return [ args, socket ];
    }

    protected static _fulfillReceivedEvent<T>(promise: PromiseLike<T>, cb: Callback<T>) {
        promise.then(value => cb(null, value), cb);
    }

    protected static _promiseHandler<T>(resolve: (value?: T) => void, reject: (reason?: any) => void) {
        return (error: any, reply: T) => !error ? resolve(reply) : reject(error);
    }

    protected static _binaryPromiseHandler(resolve: (value?: Buffer) => any, reject: any) {
        return Endpoint._promiseHandler<string>(reply => {
            reply ? resolve(Buffer.from(reply, 'binary')) : resolve();
        }, reject);
    }

    protected static _binaryarrayPromiseHandler(resolve: (value?: Buffer[]) => any, reject: any) {
        return Endpoint._promiseHandler<string[]>(reply => {
            reply ? resolve(reply.map(r => Buffer.from(r, 'binary'))) : resolve();
        }, reject);
    }

    public readonly off = super.removeListener;

    protected abstract _debug: any;

    public get isConnected(): boolean {
        return !!this._socketNamespace;
    }

    private _socketNamespace: SocketIO.Namespace | null = null;
    private _endpoints: Endpoints;
    private _redisClient: Redis.RedisClient;
    private _redlock: Redlock;
    private _redlockLocks: { [name: string]: Redlock.Lock } = {};

    protected get endpoints() {
        return this._endpoints;
    }

    protected get redisClient() {
        return this._redisClient;
    }

    protected get redlock() {
        return this._redlock;
    }

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
        nsp?: string,
    ) {
        super();

        const socketNamespace = socketServer.of(`pxt-cloud${nsp ? `/${nsp}` : ''}`);
        this._socketNamespace = socketNamespace;

        this._endpoints = endpoints;
        this._redisClient = redisClient;
        this._redlock = new Redlock([redisClient]);

        socketNamespace.on('connect', (socket: SocketIO.Socket) => {
            this._debug(`${socket.id} client connected from ${socket.handshake.address}`);
            this._onClientConnect(socket);

            socket.on('disconnect', reason => {
                this._debug(`${socket.id} client disconnected from ${socket.handshake.address} (${reason})`);
                this._onClientDisconnect(socket);
            });
        });

        socketNamespace.on('error', (error: Error) => {
            this._debug(`${error.message}\n`);
        });
    }

    public dispose() {
        this._socketNamespace = null;
    }

    protected async _initializeClient(socket?: SocketIO.Socket) {
        return true;
    }

    protected _isInitialized(socket?: SocketIO.Socket) {
        return !socket || !socket.connected || (socket as any).initialized;
    }

    protected async _ensureInitializedClient(socket?: SocketIO.Socket) {
        if (!this._isInitialized(socket)) {
            (socket as any).initialized = await this._initializeClient(socket);
        }
    }

    protected async _notifyEvent(event: string, ...args_: any[]) {
        const [ args, socket ] = Endpoint._extractSocketFromArgs(args_);

        this.emit(event, ...args);

        if (socket) {
            await this._ensureInitializedClient(socket);

            socket.broadcast.emit(event, ...args);
        }
    }

    protected async _resourceLock(name: string, ttl?: number) {
        let lock;

        try {
            lock = this._redlockLocks[name] = await this._redlock.lock(EndpointDBKeys.locks(name), ttl || 100000);
        } catch (error) {
            debug(error);
        }

        return lock;
    }

    protected async _resourceUnlock(name: string) {
        const lock = this._redlockLocks[name];

        if (lock) {
            await lock.unlock();

            delete this._redlockLocks[name];
        }

        return lock;
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        setTimeout(async () => await this._ensureInitializedClient(socket));
    }

    protected _onClientDisconnect(socket: SocketIO.Socket) {
        /* do nothing */
    }
}

export type Endpoints = { [E in keyof API.PublicAPI]: (Endpoint & API.PublicAPI[E]) | null };
