
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { EventEmitter } from 'events';
import * as Redis from 'redis';

import { ServerConfig } from './server.config';

const debug = require('debug')('pxt-cloud:server:redis');

export class RedisClient extends EventEmitter {
    /* Reference: https://github.com/NodeRedis/node_redis */
    private static _retrystrategy(options: Redis.RetryStrategyOptions): number | Error {
        const maxTotalRetryTimeSec = 60 * 15;  /* 15 minutes */
        const maxRetryTimeSec = 60 * 2;        /* 2 minutes */
        const maxTotalAttempts = 20;           /* 20 attempts */
        const randomizationJitter = 0.5;       /* jitter retry delay, zero is none */

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

        const retryDelay = Math.min(options.total_retry_time + options.attempt * 100, 1000 * maxRetryTimeSec);
        return Math.round(retryDelay * (randomizationJitter * Math.random() + (1 - randomizationJitter)));
    }

    public get client(): Redis.RedisClient |  null {
        return this._redis;
    }

    protected _redis: Redis.RedisClient | null = null;

    public connect(initialized: () => void, port_: number = ServerConfig.redisport, host_: string = ServerConfig.redishost): PromiseLike<this> {
        this.dispose();

        return new Promise((resolve, reject) => {
            const redis = new Redis.RedisClient({
                host: host_,
                port: port_,

                retry_strategy: RedisClient._retrystrategy,
            });
            this._redis = redis;

            initialized();

            redis.on('connect', () => debug(`connected`));

            redis.on('ready', () => {
                debug(`ready`);

                resolve(this);
            });

            redis.on('reconnecting', (stats) => {
                debug(`reconnecting with attempt ${stats.attempt} after ${stats.delay} msec`);

                if (stats.error) {
                    debug(`[${stats.error.message}]\n`);
                }
            });

            redis.on('end', () => {
                debug(`ended`);

                this._redis = null;
            });

            this._redis.on('error', error => {
                debug(error.message);

                reject(error);
            });
        });
    }

    public async dispose() {
        const redis = this._redis;

        if (redis) {
            this._redis = null;

            await new Promise(resolve => redis.quit(() => resolve()));
        }
    }
}
