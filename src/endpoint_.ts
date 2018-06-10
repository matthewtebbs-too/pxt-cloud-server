/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { EventEmitter } from 'events';
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from './api';

const debug = require('debug')('pxt-cloud:endpoint');

export interface IEndpointConstructor {
    new (
        publicAPI: API.PublicAPI,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
        nsp?: string,
    ): Endpoint;
}

export class Endpoint extends EventEmitter implements API.EventAPI {
    public static userId = Endpoint.connectId;

    public static connectId(socket?: SocketIO.Socket) {
        return socket ? socket.id : 'localhost';
    }

    private _publicAPI: API.PublicAPI;
    private _redisClient: Redis.RedisClient;

    protected get publicAPI() {
        return this._publicAPI;
    }

    protected get redisClient() {
        return this._redisClient;
    }

    constructor(
        publicAPI: API.PublicAPI,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
        nsp?: string,
    ) {
        super();

        this._publicAPI = publicAPI;
        this._redisClient = redisClient;

        const socketNamespace = socketServer.of(`/${nsp || ''}`);

        socketNamespace.on('connect', (socket: SocketIO.Socket) => {
            debug(`${socket.id} client connected from ${socket.handshake.address}`);

            this._onClientConnect(socket);
        });

        socketNamespace.on('error', (error: Error) => {
            debug(error);
        });
    }

    protected _broadcastEvent(event: string, ...args: any[]): boolean {
        let socket: SocketIO.Socket | null = null;

        if (args.length > 0) {
            const lastindex = args.length - 1;
            const last = args[lastindex];

            if (undefined === last || (typeof last === 'object' && 'broadcast' in last)) {
                socket = last;

                args = args.slice(0, -1);
            }
        }

        if (socket) {
            if (!socket.broadcast.emit(event, ...args)) {
                return false;
            }
        }

        if (!this.emit(event, args)) {
            return false;
        }

        return true;
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
