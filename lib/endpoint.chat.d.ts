import * as SocketIO from 'socket.io';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint_';
import { SocketServerAPI } from './socket.server';
import * as API from './api';
export declare class ChatEndpoint extends Endpoint implements API.ChatAPI {
    constructor(publicAPI: API.PublicAPI, redisAPI: RedisAPI, socketServerAPI: SocketServerAPI);
    newMessage(msg: string | API.MessageData, cb?: API.AckCallback<void>, socket?: SocketIO.Socket): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
