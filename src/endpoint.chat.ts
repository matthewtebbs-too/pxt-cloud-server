
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as SocketIO from 'socket.io';

import { AckCallback, ackHandler } from './api.base';
import { ChatAPI } from './api.chat';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';

export { ChatAPI } from './api.chat';

const debug = require('debug')('pxt-cloud:endpoint.chat');

// tslint:disable-next-line:variable-name
const ChatDBKeys = {
};

export class ChatEndpoint extends Endpoint implements ChatAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI) {
        super(socketServerAPI, redisAPI, 'pxt-cloud.chat');
    }

    public newMessage(msg: string, cb?: AckCallback<void>, socket?: SocketIO.Socket): boolean {
        const result = this._broadcastEvent('new message', msg, socket);

        if (result) {
            ackHandler<void>(cb)();
        }

        return result;
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on('new message', (msg: string, cb?: AckCallback<void>) => this.newMessage(msg, cb, socket));
    }
}
