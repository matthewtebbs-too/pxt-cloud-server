
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Redis from 'redis';

export class ClientRedis {
    private static _singleton = new ClientRedis();

    public static get singleton(): ClientRedis {
        return this._singleton;
    }

    protected _redisclient: Redis.RedisClient;

    protected constructor() {
        this._redisclient = new Redis.RedisClient({});
    }
}
