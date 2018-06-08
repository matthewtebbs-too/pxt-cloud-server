import * as SocketIO from 'socket.io';
import { AckCallback } from './api.base';
import { UserData, UsersAPI } from './api.users';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';
export { UsersAPI } from './api.users';
export declare class UsersEndpoint extends Endpoint implements UsersAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI);
    addUser(user: UserData, cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    removeUser(cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
