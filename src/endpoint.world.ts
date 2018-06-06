
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
    user: (sockid: string) => `user:${sockid}`,
};

export class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(server: any) {
        super(server, 'pxt-cloud.world');
    }

    public addUser(user: UserData, cb?: Callback<boolean>, socket?: SocketIO.Socket): boolean {
        const userkey = keys.user(Endpoint.connectId(socket));

        const multi = ClientRedis.redisAPI.multi()
            .exists(userkey)
            .hmset(userkey, user);

        return multi.exec((err, reply) => cb ? cb({ error: err, reply: reply[0] /* reply from exists */ }) : undefined);
    }

    public removeUser(cb?: Callback<boolean>, socket?: SocketIO.Socket): boolean {
        const userkey = keys.user(Endpoint.connectId(socket));

        const multi = ClientRedis.redisAPI.multi()
            .del(userkey);

        return multi.exec((err, reply) => cb ? cb({ error: err, reply: reply[0] /* reply from del */ }) : undefined);
    }

    protected _onConnection(socket: SocketIO.Socket) {
        super._onConnection(socket);

        socket.on('user_add', (...args: any[]) => this.addUser(args[0], args[1], socket));
        socket.on('user_remove', (...args: any[]) => this.removeUser(args[0], socket));

    }
}
