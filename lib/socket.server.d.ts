import * as SocketIO from 'socket.io';
export declare type SocketServerAPI = SocketIO.Server;
export declare class SocketServer {
    readonly socketAPI: SocketServerAPI | null;
    protected _socketio: SocketIO.Server | null;
    constructor(server: any);
    dispose(): void;
}
