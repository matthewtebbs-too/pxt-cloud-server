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
    syncData(name: string): PromiseLike<string[]>;
    syncDiff(name: string, diff: any | any[], apply?: boolean): PromiseLike<string[]>;
    protected _onClientConnect(socket: SocketIO.Socket): void;
}
