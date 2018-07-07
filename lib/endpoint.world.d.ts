import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from 'pxt-cloud-api';
import { Endpoint, Endpoints } from './endpoint_';
export declare class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug: any;
    private _datarepo;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    addDataSource(name: string, source: API.DataSource): boolean;
    removeDataSource(name: string): boolean;
    currentlySynced(name: string): any;
    syncDataSource(name: string): PromiseLike<string[]>;
    syncDataDiff(name: string, diff: API.DataDiff[], apply?: boolean, socket?: SocketIO.Socket): PromiseLike<string[]>;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
