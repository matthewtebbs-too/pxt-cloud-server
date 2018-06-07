/// <reference types="socket.io" />
import { AckCallback } from './api.base';
import { UserData, WorldAPI } from './api.world';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';
export declare const keys: {
    user: (sockid: string) => string;
};
export declare class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI, nsp?: string);
    addUser(user: UserData, cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    removeUser(cb?: AckCallback<boolean>, socket?: SocketIO.Socket): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
