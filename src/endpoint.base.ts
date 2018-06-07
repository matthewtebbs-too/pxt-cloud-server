/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { EventEmitter } from 'events';
import * as SocketIO from 'socket.io';

import { RedisAPI } from './client.redis';
import { SocketServerAPI } from './socket.server';

const debug = require('debug')('pxt-cloud:endpoint');

export class Endpoint extends EventEmitter {
    public static connectId(socket?: SocketIO.Socket) {
        return socket ? socket.id : 'localhost';
    }

    private _socketNamespace: SocketIO.Namespace | null = null;
    private _redisAPI: RedisAPI;

    protected get socketNamespace(): SocketIO.Namespace | null {
        return this._socketNamespace;
    }

    protected get redisAPI(): RedisAPI {
        return this._redisAPI;
    }

    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI, nsp?: string) {
        super();

        const socketNamespace = socketServerAPI.of(`/${nsp || ''}`);
        this._socketNamespace = socketNamespace;

        this._redisAPI = redisAPI;

        socketNamespace.on('connect', (socket: SocketIO.Socket) => {
            debug(`${socket.id} client connected from ${socket.handshake.address}`);

            this._onClientConnect(socket);
        });

        socketNamespace.on('error', (err: Error) => {
            debug(err);
        });
    }

    protected _broadcastEvent(event: string | symbol, ...args: any[]) {
        let socket: SocketIO.Socket | null = null;

        if (args.length > 0) {
            const lastindex = args.length - 1;
            const last = args[lastindex];

            if (undefined === last || last instanceof SocketIO) {
                socket = last;

                args = args.slice(0, -1);
            }
        }

        this.emit(event, args);

        if (socket) {
            socket.broadcast.emit(event, ...args);
        }
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        socket.on('disconnect', reason => {
            debug(`${socket.id} client disconnected from ${socket.handshake.address}\n(${reason})`);

            this._onClientDisconnect(socket);
        });
    }

    protected _onClientDisconnect(socket: SocketIO.Socket) {
        /* do nothing */
    }
}
