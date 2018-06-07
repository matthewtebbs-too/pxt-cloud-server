/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
export declare type RedisAPI = Redis.RedisClient;
export declare class RedisClient extends EventEmitter {
    private static _retrystrategy;
    readonly redisAPI: RedisAPI | null;
    protected _redis: Redis.RedisClient | null;
    connect(port_?: number, host_?: string): Promise<this>;
    dispose(): void;
}
