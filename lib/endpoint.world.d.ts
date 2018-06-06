/// <reference types="socket.io" />
import { Callback, UserData, UserId, WorldAPI } from './api.world';
import { Endpoint } from './endpoint.base';
export declare const keys: {
    userId: (id: string) => string;
    users: string;
};
export declare class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(server: any);
    addUser(user: UserData, id: UserId, cb?: Callback<boolean>): boolean;
    removeUser(id: UserId, cb?: Callback<boolean>): boolean;
    protected _onConnection(socket: SocketIO.Socket): void;
}
