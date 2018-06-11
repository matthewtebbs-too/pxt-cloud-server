
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { EventEmitter } from 'events';
import * as Redis from 'redis';

import { ServerConfig } from './server.config';

const debug = require('debug')('pxt-cloud:redis');

export class RedisClient extends EventEmitter {
    /* Reference: https://github.com/NodeRedis/node_redis */
    private static _retrystrategy(options: Redis.RetryStrategyOptions): number | Error {
        const maxTotalRetryTimeSec = 60 * 15;  /* 15 minutes */
        const maxRetryTimeSec = 60 * 2;        /* 2 minutes */
        const maxTotalAttempts = 20;           /* 20 attempts */

        let error = null;

        if (options.total_retry_time > 1000 * maxTotalRetryTimeSec) {
            error = new Error('retry time exhausted');
        } else if (options.attempt > maxTotalAttempts) {
            error = new Error('max retry attempts reached');
        }

        if (error) {
            debug(error.message);
            return error;
        }

        const nextRetryIn = options.total_retry_time + options.attempt * 100;
        return Math.min(nextRetryIn, 1000 * maxRetryTimeSec);
    }

    public get client(): Redis.RedisClient |  null {
        return this._redis;
    }

    protected _redis: Redis.RedisClient | null = null;

    public connect(initialized: () => void, port_: number = ServerConfig.redisport, host_: string = ServerConfig.redishost): Promise<this> {
        this.dispose();

        return new Promise((resolve, reject) => {
            this._redis = new Redis.RedisClient({ host: host_, port: port_, retry_strategy: RedisClient._retrystrategy });

            initialized();

            this._redis.on('connect', () => {
                debug(`connected`);
                this._redis!.on('end', () => debug(`ended`));
            });

            this._redis.on('ready', () => {
                debug(`ready`);
                resolve(this);
            });

            this._redis.on('reconnecting', (stats) => {
                debug(`reconnecting with attempt ${stats.attempt} after ${stats.delay} msec`);
                if (stats.error) {
                    debug(`[${stats.error.message}]\n`);
                }
            });

            this._redis.on('error', error => {
                debug(error.message);
                reject(error);
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
