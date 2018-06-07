/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
export declare type RedisAPI = Redis.RedisClient;
export declare class ClientRedis extends EventEmitter {
    private static _retrystrategy;
    readonly redisAPI: RedisAPI | null;
    protected _redisClient: Redis.RedisClient | null;
    connect(port_?: number, host_?: string): Promise<void>;
    dispose(): void;
}
