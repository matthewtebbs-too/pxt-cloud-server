import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { PrivateAPI } from './api_';
import { Endpoint } from './endpoint_';
export declare class UsersEndpoint extends Endpoint implements API.UsersAPI {
    constructor(privateAPI: PrivateAPI, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    selfInfo(socket?: SocketIO.Socket): Promise<API.UserData>;
    addSelf(user: API.UserData, socket?: SocketIO.Socket): Promise<boolean>;
    removeSelf(socket?: SocketIO.Socket): Promise<boolean>;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
