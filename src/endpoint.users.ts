
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
    protected _debug = debug;

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(endpoints, redisClient, socketServer, 'users');
    }

    public async selfInfo(socket?: SocketIO.Socket) {
        return await new Promise<API.UserData>((resolve, reject) => {
            const userId = Endpoint.userId(socket);
            const userkey = UsersDBKeys.user(userId);

            this.redisClient.hgetall(
                userkey,

                Endpoint._promiseHandler((reply: any) => resolve({ /* sanitize data */
                    name: reply && reply.name ? reply.name : '',

                    id: userId,
                }), reject));
        });
    }

    public async addSelf(user: API.UserData, socket?: SocketIO.Socket) {
        const userId = Endpoint.userId(socket);

        const existed = await new Promise<boolean>((resolve, reject) => {
            const userkey = UsersDBKeys.user(userId);

            const multi = this.redisClient.multi()
                .exists(userkey)
                .hmset(userkey, { /* sanitize data */
                    name: user.name || '',
                });

            multi.exec(
                Endpoint._promiseHandler((reply: any) => resolve(!!reply && reply[0] /* reply from exists */), reject),
            );
        });

        if (!existed) {
            await this._notifyEvent(API.Events.UserJoined, userId, user, socket);
        }

        return existed;
    }

    public async removeSelf(socket?: SocketIO.Socket) {
        const userId = Endpoint.userId(socket);

        const existed = await new Promise<boolean>((resolve, reject) => {
            const userkey = UsersDBKeys.user(userId);

            this.redisClient.del(
                userkey,

                Endpoint._promiseHandler((reply: any) => resolve(0 !== reply /* reply from del */), reject),
            );
        });

        if (existed) {
            await this._notifyEvent(API.Events.UserLeft, userId, socket);
        }

        return existed;
    }

    protected async _initializeClient(socket?: SocketIO.Socket) {
        const success = await super._initializeClient(socket);

        if (success) {
            if (socket) {
                socket
                    .on(API.Events.UserSelfInfo, cb => Endpoint._fulfillReceivedEvent(this.selfInfo(socket), cb))
                    .on(API.Events.UserAddSelf, (user, cb) => Endpoint._fulfillReceivedEvent(this.addSelf(user, socket), cb))
                    .on(API.Events.UserRemoveSelf, cb => Endpoint._fulfillReceivedEvent(this.removeSelf(socket), cb));
            }
        }

        return success;
    }
}
