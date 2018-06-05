import * as Redis from 'redis';
export declare class ClientRedis {
    private static _singleton;
    static readonly singleton: ClientRedis;
    protected _redisclient: Redis.RedisClient;
    protected constructor();
}
