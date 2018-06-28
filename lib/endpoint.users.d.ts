import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import { API } from './api';
import { Endpoint, Endpoints } from './endpoint_';
export declare class UsersEndpoint extends Endpoint implements API.UsersAPI {
    protected _debug: any;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    selfInfo(socket?: SocketIO.Socket): PromiseLike<API.UserData>;
    addSelf(user: API.UserData, socket?: SocketIO.Socket): PromiseLike<boolean>;
    removeSelf(socket?: SocketIO.Socket): PromiseLike<boolean>;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
