
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import * as API from 'pxt-cloud-api';

import { Endpoint, Endpoints } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint:users');

// tslint:disable-next-line:variable-name
const UsersDBKeys = {
    user: (id: string) => `user:${id}`,
};

export class UsersEndpoint extends Endpoint implements API.UsersAPI {
    protected _debug: any = debug;

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(endpoints, redisClient, socketServer, 'users');
    }

    public selfInfo(socket?: SocketIO.Socket): PromiseLike<API.UserData> {
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

                        id: userId,
                    });
                });
        });
    }

    public addSelf(user: API.UserData, socket?: SocketIO.Socket): PromiseLike<boolean> {
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
                        this._broadcastNotifyEvent(API.Events.UserJoined, userId, user, socket);
                    }

                    resolve(existed);
                });
        });
    }

    public removeSelf(socket?: SocketIO.Socket): PromiseLike<boolean> {
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
                        this._broadcastNotifyEvent(API.Events.UserLeft, userId, socket);
                    }

                    resolve(existed);
                });
        });
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket
            .on(API.Events.UserSelfInfo, cb => Endpoint._fulfillReceivedEvent(this.selfInfo(socket), cb))
            .on(API.Events.UserAddSelf, (user, cb) => Endpoint._fulfillReceivedEvent(this.addSelf(user, socket), cb))
            .on(API.Events.UserRemoveSelf, cb => Endpoint._fulfillReceivedEvent(this.removeSelf(socket), cb));
    }
}
