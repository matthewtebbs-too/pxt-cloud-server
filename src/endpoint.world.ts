
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable-next-line:variable-name
const CloneDeep = require('clone-deep');
import * as DiffDeep from 'deep-diff';

import * as Promise from 'bluebird';

/// <reference types='redis.extra' />

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import { API } from './api';

import { Endpoint, Endpoints } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint:world');

// tslint:disable-next-line:variable-name
const WorldDBKeys = {
    data: (name: string) => `data:${name}`,
};

export class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug: any = debug;

    private _synceddata = new Map<string, API.SyncedData<any>>();

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(endpoints, redisClient, socketServer, 'world');
    }

    public addSyncedData<T>(name: string, source_: API.SyncedDataSource<T>): boolean {
        const exists = this._synceddata.has(name);

        if (!exists) {
            this._synceddata.set(name, { source: source_ });
        }

        return exists;
    }

    public removeSyncedData(name: string): boolean {
        return this._synceddata.delete(name);
    }

    public syncData<T>(name: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const data = this._synceddata.get(name) as API.SyncedData<T>;
            if (!data) {
                reject();
                return;
            }

            const latest = CloneDeep(data.source, data.source.cloner);
            const diff = DiffDeep.diff(data.latest || {}, latest);
            if (!diff) {
                reject();
                return;
            }

            data.latest = latest;

            this.syncDiff(name, diff)
                .then(resolve, reject);
        });
    }

    public syncDiff(name: string, diff: any | any[] /* deep-diff's IDiff */): PromiseLike<string[]> {
        return Promise.mapSeries(
            Array.isArray(diff) ? diff : [diff],

            diff_ => new Promise((resolve, reject) => {
                const datakey = WorldDBKeys.data(name);

                this.redisClient.xadd(
                    datakey,

                    '*',

                    'change',

                    JSON.stringify(diff_),

                    (error, reply: string) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve(reply);
                    });
            }));
    }
}
