
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as SocketIO from 'socket.io';

import { AckCallback, ackHandler } from './api.base';
import { UserData, WorldAPI, WorldEvents } from './api.world';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';

const debug = require('debug')('pxt-cloud:endpoint.world');

// tslint:disable-next-line:variable-name
const WorldDBKeys = {
    user: (sockid: string) => `user:${sockid}`,
};

export class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI, nsp?: string) {
        super(socketServerAPI, redisAPI, 'pxt-cloud.world');
    }

    public addUser(user: UserData, cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean {
        const userId = Endpoint.connectId(socket);
        const userkey = WorldDBKeys.user(userId);

        const multi = this.redisAPI.multi()
            .exists(userkey)
            .hmset(userkey, user);

        return multi.exec(ackHandler<boolean>(reply => {
            const existed = !!reply[0]; /* reply from exists */

            if (!existed) {
                this._broadcastEvent(WorldEvents.userJoined, userId, user, socket);
            }

            return existed;
        }, cb));
    }

    public removeUser(cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean {
        const userId = Endpoint.connectId(socket);
        const userkey = WorldDBKeys.user(userId);

        const multi = this.redisAPI.multi()
            .del(userkey);

        return multi.exec(ackHandler<boolean>(reply => {
            const existed = !!reply[0]; /* reply from del */

            if (existed) {
                this._broadcastEvent(WorldEvents.userLeft, userId, socket);
            }

            return existed;
        }, cb));
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket.on(WorldEvents.addUser, (...args: any[]) => this.addUser(args[0], args[1], socket));
        socket.on(WorldEvents.removeUser, (...args: any[]) => this.removeUser(args[0], socket));
    }
}
