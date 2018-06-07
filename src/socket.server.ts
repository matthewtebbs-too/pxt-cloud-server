
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:interface-name

import * as SocketIO from 'socket.io';

const debug = require('debug')('pxt-cloud:socket.server');

export type SocketServerAPI = SocketIO.Server;

export class SocketServer {
    public get socketAPI(): SocketServerAPI | null {
        return this._socketio;
    }

    protected _socketio: SocketIO.Server | null = null;

    constructor(server: any) {
        this._socketio = SocketIO(server);

        debug(`listening`);
    }

    public dispose() {
        if (this._socketio) {
            this._socketio.close((() => debug(`closed`)));
            this._socketio = null;
        }
    }
}
