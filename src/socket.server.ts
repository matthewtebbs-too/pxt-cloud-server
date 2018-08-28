
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as SocketIO from 'socket.io';

const debug = require('debug')('pxt-cloud:server:sockets');

export class SocketServer {
    public get server(): SocketIO.Server | null {
        return this._socketio;
    }

    protected _socketio: SocketIO.Server | null = null;

    constructor(server: any) {
        const socketio = SocketIO(server);
        this._socketio = socketio;

        if (socketio) {
            debug(`listening`);
        }
    }

    public async dispose() {
        const socketio = this._socketio;

        if (socketio) {
            this._socketio = null;

            await new Promise(resolve => socketio.close(() => {
                debug('closed');

                resolve();
            }));
        }
    }
}
