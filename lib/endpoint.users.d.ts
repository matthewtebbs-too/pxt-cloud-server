import * as SocketIO from 'socket.io';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint_';
import { SocketServerAPI } from './socket.server';
import * as API from './api';
export declare class UsersEndpoint extends Endpoint implements API.UsersAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI);
    selfInfo(cb?: API.AckCallback<API.UserData>, socket?: SocketIO.Socket): boolean;
    addSelf(user: API.UserData, cb?: API.AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    removeSelf(cb?: API.AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
