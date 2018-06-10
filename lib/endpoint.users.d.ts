import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { Endpoint } from './endpoint_';
export declare class UsersEndpoint extends Endpoint implements API.UsersAPI {
    constructor(publicAPI: API.PublicAPI, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    selfInfo(cb?: API.AckCallback<API.UserData>, socket?: SocketIO.Socket): boolean;
    selfInfoAsync(socket?: SocketIO.Socket): Promise<API.UserData>;
    addSelf(user: API.UserData, cb?: API.AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    addSelfAsync(user: API.UserData, socket?: SocketIO.Socket): Promise<boolean>;
    removeSelf(cb?: API.AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    removeSelfAsync(socket?: SocketIO.Socket): Promise<boolean>;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
