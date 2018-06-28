import * as Promise from 'bluebird';
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from './api';
import { Endpoint, Endpoints } from './endpoint_';
export declare class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug: any;
    private _synceddata;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    addSyncedData<T>(name: string, source_: API.SyncedDataSource<T>): boolean;
    removeSyncedData(name: string): boolean;
    syncData<T>(name: string): Promise<string[]>;
    syncDiff(name: string, diff: any | any[]): PromiseLike<string[]>;
}
