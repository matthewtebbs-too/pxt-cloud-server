
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from './api';
import { Endpoint } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint.users');

// tslint:disable-next-line:variable-name
const UsersDBKeys = {
    user: (sockid: string) => `user:${sockid}`,
};

export class UsersEndpoint extends Endpoint implements API.UsersAPI {
    constructor(
        publicAPI: API.PublicAPI,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(publicAPI, redisClient, socketServer, 'pxt-cloud.users');
    }

    public selfInfo(cb?: API.AckCallback<API.UserData>, socket?: SocketIO.Socket): boolean {
        const userId = Endpoint.userId(socket);
        const userkey = UsersDBKeys.user(userId);

        return this.redisClient.hgetall(userkey, API.mappedAckHandler(reply => {
            return { /* sanitize data */
                name: reply && reply.name ? reply.name : '',
            };
        }, cb));
    }

    public addSelf(user: API.UserData, cb?: API.AckCallback<boolean>, socket?: SocketIO.Socket): boolean {
        const userId = Endpoint.userId(socket);
        const userkey = UsersDBKeys.user(userId);

        const multi = this.redisClient.multi()
            .exists(userkey)
            .hmset(userkey, { /* sanitize data */
                name: user.name || '',
            });

        return multi.exec(API.mappedAckHandler(reply => {
            const existed = !!reply && reply[0] as boolean; /* reply from exists */

            if (!existed) {
                this._broadcastEvent('user joined', userId, user, socket);
            }

            return existed;
        }, cb));
    }

    public removeSelf(cb?: API.AckCallback<boolean>, socket?: SocketIO.Socket): boolean {
        const userId = Endpoint.userId(socket);
        const userkey = UsersDBKeys.user(userId);

        return this.redisClient.del(userkey, API.mappedAckHandler(reply => {
            const existed = !!reply; /* reply from del */

            if (existed) {
                this._broadcastEvent('user left', userId, socket);
            }

            return existed;
        }, cb));
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on('self info', (cb) => this.selfInfo(cb, socket));
        socket.on('add self', (user, cb) => this.addSelf(user, cb, socket));
        socket.on('remove self', (cb) => this.removeSelf(cb, socket));
    }
}
