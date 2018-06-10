import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { Endpoint } from './endpoint_';
export declare class ChatEndpoint extends Endpoint implements API.ChatAPI {
    constructor(publicAPI: API.PublicAPI, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    newMessage(msg: string | API.MessageData, cb?: API.AckCallback<void>, socket?: SocketIO.Socket): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
