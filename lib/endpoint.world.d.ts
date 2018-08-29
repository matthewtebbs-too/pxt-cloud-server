/// <reference types="node" />
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';
import * as API from 'pxt-cloud-api';
import { Endpoint, Endpoints } from './endpoint_';
export declare class WorldEndpoint extends Endpoint implements API.WorldAPI {
    static maxExecBatchedDiffs: number;
    static factorStreamDiffs: number;
    protected _debug: any;
    private _datarepo;
    private _batchedDiffs;
    constructor(endpoints: Endpoints, redisClient: Redis.RedisClient, socketServer: SocketIO.Server);
    dispose(): Promise<void>;
    syncDataSources(): Promise<boolean>;
    setDataSource(name: string, source: API.DataSource): boolean;
    deleteDataSource(name: string): boolean;
    pullAllData(socket?: SocketIO.Socket): Promise<{
        name: string;
        data: any;
    }[]>;
    pullData(name: string, socket?: SocketIO.Socket): Promise<any>;
    pushAllData(unlock?: boolean, socket?: SocketIO.Socket): Promise<void>;
    pushData(name: string, unlock?: boolean, socket?: SocketIO.Socket): Promise<void>;
    pushDataDiff(name: string, diff: API.DataDiff[] | undefined, unlock?: boolean, socket?: SocketIO.Socket): Promise<void>;
    lockData(name: string, socket?: SocketIO.Socket): Promise<boolean>;
    unlockData(name: string, socket?: SocketIO.Socket): Promise<boolean>;
    protected _getBatchedDiff(name: string): {
        multi: Redis.Multi;
        batchExisted: boolean;
    };
    protected _initializeClient(socket?: SocketIO.Socket): Promise<boolean>;
    protected _pullAllData(socket?: SocketIO.Socket): Promise<API.Tagged<Buffer>[]>;
    protected _pullData(name: string, socket?: SocketIO.Socket): Promise<Buffer>;
    protected _pullDataDiff(name: string, socket?: SocketIO.Socket): Promise<Buffer[]>;
    protected _pushAllData(tencdata: Array<API.Tagged<Buffer>>, unlock?: boolean, socket?: SocketIO.Socket): Promise<void>;
    protected _pushData(name: string, encdata: Buffer, unlock?: boolean, socket?: SocketIO.Socket): Promise<void>;
    protected _pushDataDiff(name: string, encdiff: Buffer[], unlock?: boolean, socket?: SocketIO.Socket): Promise<void>;
    protected _flushAllBatchedDiffs(forceFlush?: boolean): Promise<void>;
    protected _flushBatchedDiffs(name: string, forceFlush?: boolean): Promise<void>;
    protected _deleteAllPushedDiff(name: string): Promise<void>;
    protected _lockData(name: string, socket?: SocketIO.Socket): Promise<boolean>;
    protected _unlockData(name: string, socket?: SocketIO.Socket): Promise<boolean>;
}
