/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { EventEmitter } from 'events';

import { RedisAPI } from './client.redis';
import { SocketServerAPI } from './socket.server';

const debug = require('debug')('pxt-cloud:endpoint');

export class Endpoint extends EventEmitter {
    public static connectId(socket?: SocketIO.Socket) {
        return socket ? socket.id : '';
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
