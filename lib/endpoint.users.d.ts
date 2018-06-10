import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { Endpoint } from './endpoint_';
export declare class UsersEndpoint extends Endpoint implements API.UsersAPI {
    constructor(publicAPI: API.PublicAPI, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    selfInfo(cb?: API.AckCallback<API.UserData>, socket?: SocketIO.Socket): boolean;
    addSelf(user: API.UserData, cb?: API.AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    removeSelf(cb?: API.AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
