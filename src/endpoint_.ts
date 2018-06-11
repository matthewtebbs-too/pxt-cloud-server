/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { EventEmitter } from 'events';
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from './api';
import { PrivateAPI } from './api_';

const debug = require('debug')('pxt-cloud:endpoint');

export type Callback<T> = (error: Error | null, reply?: T) => void;

export class Endpoint extends EventEmitter implements API.EventAPI {
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

                args = args.slice(0, -1);
            }
        }

        return [ args, socket ];
    }

    protected static _onPromisedEvent<T>(promise: Promise<T>, cb: Callback<T>) {
        promise.then(value => cb(null, value), cb);
    }

    private _privateAPI: PrivateAPI;
    private _redisClient: Redis.RedisClient;

    protected get privateAPI() {
        return this._privateAPI;
    }

    protected get redisClient() {
        return this._redisClient;
    }

    constructor(
        privateAPI: PrivateAPI,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
        nsp?: string,
    ) {
        super();

        this._privateAPI = privateAPI;
        this._redisClient = redisClient;

        const socketNamespace = socketServer.of(`/${nsp || ''}`);

        socketNamespace.on('connect', (socket: SocketIO.Socket) => {
            debug(`${socket.id} client connected from ${socket.handshake.address}`);

            this._onClientConnect(socket);
        });

        socketNamespace.on('error', (error: Error) => {
            debug(`${error.message}\n`);
        });
    }

    public dispose() {
        /* do nothing */
    }

    protected _broadcastEvent(event: string, ...args_: any[]): boolean {
        const [ args, socket ] = Endpoint._extractSocketFromArgs(args_);

        if (socket) {
            if (!socket.broadcast.emit(event, ...args)) {
                return false;
            }
        }

        return this.emit(event, args);
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        socket.on('disconnect', reason => {
            debug(`${socket.id} client disconnected from ${socket.handshake.address} (${reason})`);

            this._onClientDisconnect(socket);
        });
    }

    protected _onClientDisconnect(socket: SocketIO.Socket) {
        /* do nothing */
    }
}
