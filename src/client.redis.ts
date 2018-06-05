
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { EventEmitter } from 'events';
import * as Redis from 'redis';

import { ServerConfig } from './server.config';

const debug = require('debug')('pxt-cloud:redis');

export class ClientRedis extends EventEmitter {
    public static callbackHandler<T>(err: Error | null, reply: T) {
        if (err) {
            debug(err);
        }
    }

    private static _singleton = new ClientRedis();

    /* Reference: https://github.com/NodeRedis/node_redis */
    private static _retrystrategy(options: Redis.RetryStrategyOptions): number | Error {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            debug(options.error);
            return new Error('connection refused');
        }

        if (options.total_retry_time > 1000 * 60 * 60) {
            debug('total retry timeout');
            return new Error('retry time exhausted');
        }

        if (options.attempt > 10) {
            debug('max attempts');
            return new Error('max retry attempts reached');
        }

        return Math.min(options.attempt * 100, 3000);
    }

    public static get singleton(): ClientRedis {
        return this._singleton;
    }

    public static get redisAPI(): Redis.RedisClient {
        return this.singleton._redisClient;
    }

    protected _redisClient: Redis.RedisClient;

    protected constructor(port_: number = ServerConfig.redisport, host_: string = ServerConfig.redishost) {
        super();

        this._redisClient = new Redis.RedisClient({ host: host_, port: port_, retry_strategy: ClientRedis._retrystrategy });

        this._redisClient.on('ready', () => debug(`connection ready`));
        this._redisClient.on('end', () => debug(`connection ended`));
        this._redisClient.on('error', error => debug(error));
    }

    public dispose() {
        this._redisClient.quit();
    }
}
