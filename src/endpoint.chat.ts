
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from 'pxt-cloud-api';

import { UsersEndpoint } from './endpoint.users';
import { Endpoint, Endpoints } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint:chat');

// tslint:disable-next-line:variable-name
const ChatDBKeys = {
};

export class ChatEndpoint extends Endpoint implements API.ChatAPI {
    protected _debug: any = debug;

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(endpoints, redisClient, socketServer, 'chat');
    }

    public async newMessage(msg: string | API.MessageData, socket?: SocketIO.Socket) {
        const user = await (this.endpoints.users! as UsersEndpoint).selfInfo(socket);

        if (typeof msg !== 'object') {
            msg = { text: msg };
        }

        this._broadcastNotifyEvent(API.Events.ChatNewMessage, { ...msg, name: user.name }, socket);
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on(API.Events.ChatNewMessage, (msg, cb) => Endpoint._fulfillReceivedEvent(this.newMessage(msg, socket), cb));
    }
}
