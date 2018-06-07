
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:interface-name

import { EventEmitter } from 'events';
import * as Redis from 'redis';

import { ServerConfig } from './server.config';

const debug = require('debug')('pxt-cloud:redis');

export type RedisAPI = Redis.RedisClient;

export class RedisClient extends EventEmitter {
    /* Reference: https://github.com/NodeRedis/node_redis */
    private static _retrystrategy(options: Redis.RetryStrategyOptions): number | Error {
        let error = null;

        if (options.error && options.error.code === 'ECONNREFUSED') {
            error = options.error;
        } else if (options.total_retry_time > 1000 * 60 * 60) {
            error = Error('retry time exhausted');
        } else if (options.attempt > 10) {
            error = new Error('max retry attempts reached');
        }

        if (error) {
            debug(error);
            return error;
        }

        return Math.min(options.attempt * 100, 3000);
    }

    public get redisAPI(): RedisAPI |  null {
        return this._redis;
    }

    protected _redis: Redis.RedisClient | null = null;

    public connect(port_: number = ServerConfig.redisport, host_: string = ServerConfig.redishost): Promise<this> {
        this.dispose();

        return new Promise((resolve, reject) => {
            this._redis = new Redis.RedisClient({ host: host_, port: port_, retry_strategy: RedisClient._retrystrategy });

            this._redis.on('ready', () => {
                this._redis!.on('end', () => debug(`connection ended`));

                debug(`connection ready`);
                resolve(this);
            });

            this._redis.on('error', err => {
                debug(err);
                reject(err);
            });
        });
    }

    public dispose() {
        if (this._redis) {
            this._redis.quit();
            this._redis = null;
        }
    }
}
