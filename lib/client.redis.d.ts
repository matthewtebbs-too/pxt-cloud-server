/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
export declare class ClientRedis extends EventEmitter {
    static callbackHandler<T>(err: Error | null, reply: T): void;
    private static _singleton;
    private static _retrystrategy;
    static readonly singleton: ClientRedis;
    static readonly redisAPI: Redis.RedisClient;
    protected _redisClient: Redis.RedisClient;
    protected constructor(port_?: number, host_?: string);
    dispose(): void;
}
