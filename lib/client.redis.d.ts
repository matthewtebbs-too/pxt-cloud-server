import * as Redis from 'redis';
export declare class ClientRedis {
    private static _singleton;
    private static _retrystrategy(options);
    static readonly singleton: ClientRedis;
    protected _redisclient: Redis.RedisClient;
    protected constructor(port_?: number, host_?: string);
    dispose(): void;
}
