
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

                (error, reply) => {
                    if (!error) {
                        resolve({ /* sanitize data */
                            name: reply && reply.name ? reply.name : '',

                            id: userId,
                        });
                    } else {
                        reject(error);
                    }
                });
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
                (error, reply) => {
                    if (!error) {
                        resolve(!!reply && reply[0] /* reply from exists */);
                    } else {
                        reject(error);
                    }
                });
        });

        if (!existed) {
            this._notifyAndBroadcastEvent(API.Events.UserJoined, userId, user, socket);
        }

        return existed;
    }

    public async removeSelf(socket?: SocketIO.Socket) {
        const userId = Endpoint.userId(socket);

        const existed = await new Promise<boolean>((resolve, reject) => {
            const userkey = UsersDBKeys.user(userId);

            this.redisClient.del(
                userkey,

                (error, reply) => {
                    if (!error) {
                        resolve(0 !== reply /* reply from del */);
                    } else {
                        reject(error);
                    }
                });
        });

        if (existed) {
            this._notifyAndBroadcastEvent(API.Events.UserLeft, userId, socket);
        }

        return existed;
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket
            .on(API.Events.UserSelfInfo, cb => Endpoint._fulfillReceivedEvent(this.selfInfo(socket), cb))
            .on(API.Events.UserAddSelf, (user, cb) => Endpoint._fulfillReceivedEvent(this.addSelf(user, socket), cb))
            .on(API.Events.UserRemoveSelf, cb => Endpoint._fulfillReceivedEvent(this.removeSelf(socket), cb));
    }
}
