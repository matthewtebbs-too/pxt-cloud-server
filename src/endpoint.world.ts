
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:object-literal-key-quotes

import { UserData, UserId, WorldAPI } from './api.world';
import { ClientRedis } from './client.redis';
import { Endpoint } from './endpoint.base';

const debug = require('debug')('pxt-cloud:endpoint.world');

export const keys = {
    userId: (id: string) => `user:${id}`,
    users: 'users',
};

export class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(server: any) {
        super(server, 'pxt-cloud.world');
    }

    public addUser(user?: UserData, id?: UserId): boolean {
        let success = !!user && !!id;

        if (success) {
            success = ClientRedis.redisAPI.sadd(keys.users, id!, ClientRedis.callbackHandler);
        }

        if (success) {
            success = ClientRedis.redisAPI.hmset(keys.userId(id!), { 'username': user!.name }, ClientRedis.callbackHandler);
        }

        return success;
    }

    public removeUser(id?: UserId): boolean {
        let success = !!!id;

        if (success) {
            success = ClientRedis.redisAPI.hdel(keys.userId(id!), ['username'], ClientRedis.callbackHandler);
        }

        if (success) {
            success = ClientRedis.redisAPI.srem(keys.users, id!, ClientRedis.callbackHandler);
        }

        return success;
    }

    protected _onConnection(socket: SocketIO.Socket) {
        super._onConnection(socket);

        socket.on('user_add', (...args) => this.addUser(...args));
        socket.on('user_remove', (...args) => this.removeUser(...args));

    }
}
