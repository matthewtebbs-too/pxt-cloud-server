import * as SocketIO from 'socket.io';
import { AckCallback } from './api.base';
import { ChatAPI } from './api.chat';
import { RedisAPI } from './client.redis';
import { Endpoint } from './endpoint.base';
import { SocketServerAPI } from './socket.server';
export { ChatAPI } from './api.chat';
export declare class ChatEndpoint extends Endpoint implements ChatAPI {
    constructor(socketServerAPI: SocketServerAPI, redisAPI: RedisAPI);
    newMessage(msg: string, cb?: AckCallback<void>, socket?: SocketIO.Socket): boolean;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
