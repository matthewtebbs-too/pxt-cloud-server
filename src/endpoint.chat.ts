
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from './api';
import { Endpoint } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint.chat');

// tslint:disable-next-line:variable-name
const ChatDBKeys = {
};

export class ChatEndpoint extends Endpoint implements API.ChatAPI {
    constructor(
        publicAPI: API.PublicAPI,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(publicAPI, redisClient, socketServer, 'pxt-cloud.chat');
    }

    public newMessage(msg: string | API.MessageData, socket?: SocketIO.Socket): Promise<void> {
        return this.publicAPI.users!
            .selfInfo()
            .then(user => {
                this._broadcastEvent('new message', typeof msg === 'object' ? msg : { name: user.name, text: msg }, socket);
            });
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on('new message', (msg, cb) => this.newMessage(msg, socket));
    }
}
