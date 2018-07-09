
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

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
    protected static _maxPersistedDiffs = 60;  /* max 60 diffs */

    protected _debug = debug;

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

    public async currentlySynced(name: string): Promise<object | undefined> {
        return this._datarepo.currentlySynced(name) || await this._persistedData(name);
    }

    public async syncDataSource(name: string) {
        const diff = this._datarepo.calcDataDiff(name);

        if (diff) {
            await this.syncDataDiff(name, diff);
        }
    }

    public async syncDataDiff(name: string, diff: API.DataDiff[], socket?: SocketIO.Socket) {
        await this._persistDataDiff(name, diff);

        this._notifyAndBroadcastEvent(API.Events.WorldSyncDataDiff, { name, diff }, socket);
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket
            .on(API.Events.WorldSyncDataDiff, ({ name, diff }, cb) =>
                Endpoint._fulfillReceivedEvent(this.syncDataDiff(name, diff, socket), cb));
    }

    protected async _persistDataDiff(name: string, diff: API.DataDiff[]) {
        const datakey = WorldDBKeys.data(name);

        const count = await new Promise((resolve, reject) => {
            this.redisClient.llen(
                datakey,

                (error, reply) => {
                    if (!error) {
                        resolve(reply);
                    } else {
                        reject(error);
                    }
                },
            );
        });

        if (count >= WorldEndpoint._maxPersistedDiffs) {
            const diffPersisted = API.DataRepo.calcDataDiff({}, await this._persistedData(name));

            await new Promise((resolve, reject) => {
                this.redisClient.del(
                    datakey,

                    error => {
                        if (!error) {
                            resolve();
                        } else {
                            reject(error);
                        }
                    },
                );
            });

            await this._persistDataDiff(name, diffPersisted);
        }

        diff.forEach(async diff_ =>
            await new Promise((resolve, reject) => {
                this.redisClient.rpush(
                    datakey,

                    diff_.toString('binary'),

                    error => {
                        if (!error) {
                            resolve();
                        } else {
                            reject(error);
                        }
                    },
                );
            }),
        );
    }

    protected async _persistedData(name: string) {
        const diff = await new Promise<API.DataDiff[]>((resolve, reject) => {
            const datakey = WorldDBKeys.data(name);

            this.redisClient.lrange(
                datakey,

                0, -1,

                (error, reply) => {
                    if (!error) {
                        resolve(reply.map(diff_ => Buffer.from(diff_, 'binary')));
                    } else {
                        reject(error);
                    }
                },
            );
        });

        return API.DataRepo.applyDataDiff({}, diff);
    }
}
