
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from './api';
import * as API_ from './api_';

import { UsersEndpoint } from './endpoint.users';
import { Endpoint } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint:chat');

// tslint:disable-next-line:variable-name
const ChatDBKeys = {
};

export class ChatEndpoint extends Endpoint implements API.ChatAPI {
    protected _debug: any = debug;

    constructor(
        privateAPI: API_.PrivateAPI,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(privateAPI, redisClient, socketServer, 'chat');
    }

    public newMessage(msg: string | API.MessageData, socket?: SocketIO.Socket): Promise<void> {
        return (this.privateAPI.users! as any as UsersEndpoint)
            .selfInfo(socket)
            .then(user => {
                if (typeof msg !== 'object') {
                    msg = { text: msg };
                }

                this._broadcastNotifyEvent('new message', { ...msg, name: user.name }, socket);
            });
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on('new message', (msg, cb) => Endpoint._fulfillReceivedEvent(this.newMessage(msg, socket), cb));
    }
}
