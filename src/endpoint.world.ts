
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Promise from 'bluebird';

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

/// <reference types='redis.extra' />

import * as API from 'pxt-cloud-api';

import { Endpoint, Endpoints } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint:world');

// tslint:disable-next-line:variable-name
const WorldDBKeys = {
    data: (name: string) => `data:${name}`,
};

export class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug: any = debug;

    private _datarepo = new API.DataRepo();

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(endpoints, redisClient, socketServer, 'world');
    }

    public addDataSource(name: string, source: API.DataSource): boolean {
        return this._datarepo.addDataSource(name, source);
    }

    public removeDataSource(name: string): boolean {
        return this._datarepo.removeDataSource(name);
    }

    public syncDataSource(name: string): PromiseLike<string[]> {
        return this.syncDataDiff(name, this._datarepo.syncDataSource(name), false);
    }

    public syncDataDiff(name: string, diff: any /* deep-diff's IDiff */, apply: boolean = true): PromiseLike<string[]> {
        debug(diff);

        if (!diff) {
            return Promise.resolve([]);
        }

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
                    },
                );

                if (apply) {
                    this._datarepo.syncDataDiff(name, diff_);

                    debug(this._datarepo.currentlySynced(name));
                }
            }));
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket
            .on(API.Events.WorldSyncDataDiff, ({ name, diff }, cb) =>
                Endpoint._fulfillReceivedEvent(this.syncDataDiff(name, diff), cb));
    }
}
