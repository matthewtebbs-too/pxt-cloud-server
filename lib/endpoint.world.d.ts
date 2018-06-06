/// <reference types="socket.io" />
import { UserData, UserId, WorldAPI } from './api.world';
import { Endpoint } from './endpoint.base';
export declare const keys: {
    userId: (id: string) => string;
    users: string;
};
export declare class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(server: any);
    addUser(user?: UserData, id?: UserId): boolean;
    removeUser(id?: UserId): boolean;
    protected _onConnection(socket: SocketIO.Socket): void;
}
