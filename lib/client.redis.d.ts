/// <reference types="node" />
import { EventEmitter } from 'events';
import * as Redis from 'redis';
export declare class RedisClient extends EventEmitter {
    private static _retrystrategy;
    readonly client: Redis.RedisClient | null;
    protected _redis: Redis.RedisClient | null;
    connect(initialized: () => void, port_?: number, host_?: string): PromiseLike<this>;
    dispose(): void;
}
