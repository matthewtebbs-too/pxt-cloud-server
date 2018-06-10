import * as SocketIO from 'socket.io';
export declare class SocketServer {
    readonly server: SocketIO.Server | null;
    protected _socketio: SocketIO.Server | null;
    constructor(server: any);
    dispose(): void;
}
