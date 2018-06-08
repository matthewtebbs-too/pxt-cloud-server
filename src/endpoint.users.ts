
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as SocketIO from 'socket.io';

import { AckCallback, ackHandler } from './api.base';
import { UserData, UsersAPI } from './api.users';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';

export { UsersAPI } from './api.users';

const debug = require('debug')('pxt-cloud:endpoint.users');

// tslint:disable-next-line:variable-name
const UsersDBKeys = {
    user: (sockid: string) => `user:${sockid}`,
};

export class UsersEndpoint extends Endpoint implements UsersAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI) {
        super(socketServerAPI, redisAPI, 'pxt-cloud.users');
    }

    public addUser(user: UserData, cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean {
        const userId = Endpoint.connectId(socket);
        const userkey = UsersDBKeys.user(userId);

        const multi = this.redisAPI.multi()
            .exists(userkey)
            .hmset(userkey, user);

        return multi.exec(ackHandler<boolean>(cb, reply => {
            const existed = !!reply && reply[0]; /* reply from exists */

            if (!existed) {
                this._broadcastEvent('user joined', userId, user, socket);
            }

            return existed;
        }));
    }

    public removeUser(cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean {
        const userId = Endpoint.connectId(socket);
        const userkey = UsersDBKeys.user(userId);

        const multi = this.redisAPI.multi()
            .del(userkey);

        return multi.exec(ackHandler<boolean>(cb, reply => {
            const existed = !!reply && reply[0]; /* reply from del */

            if (existed) {
                this._broadcastEvent('user left', userId, socket);
            }

            return existed;
        }));
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on('add user', (user: UserData, cb?: AckCallback<boolean>) => this.addUser(user, cb, socket));
        socket.on('remove user', (cb?: AckCallback<boolean>) => this.removeUser(cb, socket));
    }
}
