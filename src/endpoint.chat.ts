
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as SocketIO from 'socket.io';

import { AckCallback, ackHandler, ackHandlerVoid } from './api.base';
import { ChatAPI, MessageData } from './api.chat';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';

export { ChatAPI, MessageData } from './api.chat';

const debug = require('debug')('pxt-cloud:endpoint.chat');

// tslint:disable-next-line:variable-name
const ChatDBKeys = {
};

export class ChatEndpoint extends Endpoint implements ChatAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI) {
        super(socketServerAPI, redisAPI, 'pxt-cloud.chat');
    }

    public newMessage(msg: string | MessageData, cb?: AckCallback<void>, socket?: SocketIO.Socket): boolean {
        const result = this._broadcastEvent('new message', typeof msg === 'object' ? msg : { text: msg }, socket);

        if (result) {
            ackHandlerVoid(cb);
        }

        return result;
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on('new message', (msg: MessageData, cb?: AckCallback<void>) => this.newMessage(msg, cb, socket));
    }
}
