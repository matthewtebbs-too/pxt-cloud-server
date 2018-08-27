import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from 'pxt-cloud-api';
import { Endpoint, Endpoints } from './endpoint_';
export declare class UsersEndpoint extends Endpoint implements API.UsersAPI {
    protected _debug: any;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    selfInfo(socket?: SocketIO.Socket): Promise<API.UserData>;
    addSelf(user: API.UserData, socket?: SocketIO.Socket): Promise<boolean>;
    removeSelf(socket?: SocketIO.Socket): Promise<boolean>;
    protected _initializeClient(socket?: SocketIO.Socket): Promise<boolean>;
    protected _uninitializeClient(socket?: SocketIO.Socket): Promise<boolean>;
}
