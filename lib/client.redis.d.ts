/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
export declare type RedisAPI = Redis.RedisClient;
export declare class ClientRedis extends EventEmitter {
    private static _singleton;
    private static _retrystrategy;
    static readonly singleton: ClientRedis;
    static readonly redisAPI: RedisAPI;
    protected _redisClient: Redis.RedisClient;
    protected constructor(port_?: number, host_?: string);
    dispose(): void;
}
