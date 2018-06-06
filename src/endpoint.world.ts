
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:object-literal-key-quotes

import { Callback, UserData, UserId, WorldAPI } from './api.world';
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

    public addUser(user: UserData, id: UserId, cb?: Callback<boolean>): boolean {
        const multi = ClientRedis.redisAPI.multi()
            .sadd(keys.users, id)
            .hmset(keys.userId(id), user);

        return multi.exec((err, reply) => cb ? cb({ error: err, reply: reply[0] /* reply from sadd */ }) : undefined);
    }

    public removeUser(id: UserId, cb?: Callback<boolean>): boolean {
        const multi = ClientRedis.redisAPI.multi()
            .srem(keys.users, id)
            .del(keys.userId(id));

        return multi.exec((err, reply) => cb ? cb({ error: err, reply: reply[0] /* reply from srem */ }) : undefined);
    }

    protected _onConnection(socket: SocketIO.Socket) {
        super._onConnection(socket);

        socket.on('user_add', this.addUser);
        socket.on('user_remove', this.removeUser);

    }
}
