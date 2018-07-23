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
    syncDataSources(): Promise<boolean>;
    setDataSource(name: string, source: API.DataSource): boolean;
    deleteDataSource(name: string): boolean;
    pullAllData(socket?: SocketIO.Socket): Promise<{
        name: string;
        data: any;
    }[]>;
    pullData(name: string, socket?: SocketIO.Socket): Promise<any>;
    pushAllData(socket?: SocketIO.Socket): Promise<void>;
    pushData(name: string, socket?: SocketIO.Socket): Promise<void>;
    pushDataDiff(name: string, diff: API.DataDiff[], socket?: SocketIO.Socket): Promise<void>;
    protected _initializeClient(socket?: SocketIO.Socket): Promise<boolean>;
    protected _pullAllData(socket?: SocketIO.Socket): Promise<API.Tagged<Buffer>[]>;
    protected _pullData(name: string, socket?: SocketIO.Socket): Promise<Buffer>;
    protected _pullDataDiff(name: string, socket?: SocketIO.Socket): Promise<Buffer[]>;
    protected _pushAllData(tencdata: Array<API.Tagged<Buffer>>, socket?: SocketIO.Socket): Promise<void>;
    protected _pushData(name: string, encdata: Buffer, socket?: SocketIO.Socket): Promise<void>;
    protected _pushDataDiff(name: string, encdiff: Buffer[], socket?: SocketIO.Socket): Promise<void>;
    protected _deleteAllPushedDiff(name: string): Promise<void>;
}
