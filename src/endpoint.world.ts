
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:object-literal-key-quotes

import { AckCallback, ackHandler } from './api.base';
import { UserData, WorldAPI } from './api.world';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';

const debug = require('debug')('pxt-cloud:endpoint.world');

export const keys = {
    user: (sockid: string) => `user:${sockid}`,
};

export class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(server: any, redisAPI: RedisAPI) {
        super(server, redisAPI, 'pxt-cloud.world');
    }

    public addUser(user: UserData, cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean {
        const userkey = keys.user(Endpoint.connectId(socket));

        const multi = this.redisAPI.multi()
            .exists(userkey)
            .hmset(userkey, user);

        return multi.exec(ackHandler<boolean>(reply => reply[0] /* reply from exists */, cb));
    }

    public removeUser(cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean {
        const userkey = keys.user(Endpoint.connectId(socket));

        const multi = this.redisAPI.multi()
            .del(userkey);

        return multi.exec(ackHandler<boolean>(reply => reply[0] /* reply from del */, cb));
    }

    protected _onConnection(socket: SocketIO.Socket) {
        super._onConnection(socket);

        socket.on('user_add', (...args: any[]) => this.addUser(args[0], args[1], socket));
        socket.on('user_remove', (...args: any[]) => this.removeUser(args[0], socket));
    }
}
