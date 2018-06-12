
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as SocketIO from 'socket.io';

const debug = require('debug')('pxt-cloud:socket.server');

export class SocketServer {
    public get server(): SocketIO.Server | null {
        return this._socketio;
    }

    protected _socketio: SocketIO.Server | null = null;

    constructor(server: any) {
        this._socketio = SocketIO(server);

        if (this._socketio) {
            debug(`listening`);
        }
    }

    public dispose() {
        if (this._socketio) {
            this._socketio.close((() => debug(`closed`)));
            this._socketio = null;
        }
    }
}
