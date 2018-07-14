/// <reference types="node" />
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from 'pxt-cloud-api';
import { Endpoint, Endpoints } from './endpoint_';
export declare class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug: any;
    private _datarepo;
    private _batchedDiffs;
    private _batchedCount;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    setDataSource(name: string, source: API.DataSource): boolean;
    deleteDataSource(name: string): boolean;
    currentlySynced(name: string): Promise<object | undefined>;
    syncDataSource(name: string): Promise<void>;
    syncDataDiff(name: string, diff: API.DataDiff[], socket?: SocketIO.Socket): Promise<void>;
    protected _initializeClient(socket?: SocketIO.Socket): Promise<boolean>;
    protected _persistedDiff(name: string): Promise<Buffer[]>;
    protected _persistDiff(name: string, diff: API.DataDiff[]): Promise<void>;
    protected _deleteAllPersistedDiff(name: string): Promise<void>;
    protected _allPersistedData(): Promise<{
        name: string;
        data: {};
    }[]>;
    protected _persistedData(name: string): Promise<{}>;
    protected _persistData(name: string, data: object): Promise<void>;
}
