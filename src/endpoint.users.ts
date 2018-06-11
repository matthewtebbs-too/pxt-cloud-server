
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

    public selfInfo(socket?: SocketIO.Socket): Promise<API.UserData> {
        return new Promise((resolve, reject) => {
            const userId = Endpoint.userId(socket);
            const userkey = UsersDBKeys.user(userId);

            this.redisClient.hgetall(
                userkey,

                (error, reply) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve({ /* sanitize data */
                        name: reply && reply.name ? reply.name : '',
                    });
                });
        });
    }

    public addSelf(user: API.UserData, socket?: SocketIO.Socket): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const userId = Endpoint.userId(socket);
            const userkey = UsersDBKeys.user(userId);

            const multi = this.redisClient.multi()
                .exists(userkey)
                .hmset(userkey, { /* sanitize data */
                    name: user.name || '',
                });

            multi.exec(
                (error, reply) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    const existed = !!reply && reply[0] as boolean; /* reply from exists */

                    if (!existed) {
                        this._broadcastEvent('user joined', userId, user, socket);
                    }

                    resolve(existed);
                });
        });
    }

    public removeSelf(socket?: SocketIO.Socket): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const userId = Endpoint.userId(socket);
            const userkey = UsersDBKeys.user(userId);

            this.redisClient.del(
                userkey,

                (error, reply) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    const existed = !!reply; /* reply from del */

                    if (existed) {
                        this._broadcastEvent('user left', userId, socket);
                    }

                    resolve(existed);
                });
        });
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on('self info', (cb) => this.selfInfo(socket));
        socket.on('add self', (user, cb) => this.addSelf(user, socket));
        socket.on('remove self', (cb) => this.removeSelf(socket));
    }
}
