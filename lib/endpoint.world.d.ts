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
    currentlySynced(name: string): Promise<object | undefined>;
    syncDataSource(name: string): Promise<void>;
    syncDataDiff(name: string, diff: API.DataDiff[], socket?: SocketIO.Socket): Promise<void>;
    protected _onClientConnect(socket: SocketIO.Socket): void;
    protected _persistDiff(name: string, diff: API.DataDiff[]): Promise<void>;
    protected _persistedData(name: string): Promise<{}>;
    protected _persistData(name: string, data: object): Promise<{}>;
}
