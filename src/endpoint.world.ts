
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
        const diff_ = this._datarepo.syncDataSource(name);

        return diff_ ? this.syncDataDiff(name, diff_, false) : Promise.resolve([]);
    }

    public syncDataDiff(name: string, diff_: API.DataDiff[], apply: boolean = true): PromiseLike<string[]> {
        return Promise.mapSeries(
            diff_,

            d => new Promise((resolve, reject) => {
                const datakey = WorldDBKeys.data(name);

                this.redisClient.xadd(
                    datakey,

                    '*',

                    'diff',

                    d.toString(),

                    (error, reply: string) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (apply) {
                            this._datarepo.syncDataDiff(name, [d]);
                        }

                        resolve(reply);
                    },
                );
            }));
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket
            .on(API.Events.WorldSyncDataDiff, ({ name, diff }, cb) =>
                Endpoint._fulfillReceivedEvent(this.syncDataDiff(name, diff), cb));
    }
}
