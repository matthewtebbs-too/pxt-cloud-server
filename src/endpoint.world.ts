
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
    dataDiff: (name: string) => `diff:${name}`,

    nameFromKey: (key: string) => key.substr(key.indexOf(':') + 1),
};

export class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug = debug;

    private _datarepo = new API.DataRepo();
    private _batchedDiffs: { [key: string]: Redis.Multi } = {};
    private _batchedCount = 0;

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
        let current = this._datarepo.currentlySynced(name);

        if (!current) {
            await this._collapseDiff(name);

            current = await this._persistedData(name);
        }

        return current;
    }

    public async syncDataSource(name: string) {
        const diff = this._datarepo.calcDataDiff(name);

        if (diff) {
            await this.syncDataDiff(name, diff);
        }
    }

    public async syncDataDiff(name: string, diff: API.DataDiff[], socket?: SocketIO.Socket) {
        await this._persistDiff(name, diff);

        await this._notifyEvent(API.Events.WorldSyncDataDiff, { name, diff }, socket);
    }

    protected async _initializeClient(socket?: SocketIO.Socket) {
        let success = await super._initializeClient(socket);

        if (success) {
            if (socket) {
                (await this._allPersistedData())
                    .forEach(({ name, data }) => success = success && socket.emit(API.Events.WorldSyncData, { name, data: API.DataRepo.encode(data)}));
            }
        }

        return success;

    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket
            .on(API.Events.WorldSyncDataDiff, ({ name, diff }, cb) =>
                Endpoint._fulfillReceivedEvent(this.syncDataDiff(name, diff, socket), cb));
    }

    protected async _clearDiff(name: string) {
        await new Promise((resolve, reject) => this.redisClient.del(WorldDBKeys.dataDiff(name), Endpoint._promiseHandler(resolve, reject)));
    }

    protected async _persistDiff(name: string, diff: API.DataDiff[]) {
        const maxBatchQueue = 50;  /* batch max 50 commands */

        let multi = this._batchedDiffs[name];

        if (!multi) {
            multi = this._batchedDiffs[name] = this.redisClient.batch();
        }

        diff.forEach(d => multi.rpush(WorldDBKeys.dataDiff(name), d.toString('binary')));

        if (multi.queue.length >= maxBatchQueue) {
            await this._collapseDiff(name);
        }
    }

    protected async _collapseDiff(name: string) {
        const current = await this._persistedData(name);
        const diff = await this._persistedDiff(name);

        await this._persistData(name, API.DataRepo.applyDataDiff(current, diff));
        await this._clearDiff(name);
    }

    protected async _persistedDiff(name: string) {
        return await new Promise<API.DataDiff[]>((resolve, reject) =>
            this.redisClient.lrange(
                WorldDBKeys.dataDiff(name),

                0, -1,

                Endpoint._buffersPromiseHandler(resolve, reject),
            ),
        );
    }

    protected async _allPersistedData() {
        const datakeys = await new Promise<string[]>((resolve, reject) => this.redisClient.keys(WorldDBKeys.data('*'), Endpoint._promiseHandler(resolve, reject)));

        const result = [];

        for (const datakey of datakeys) {
            const name = WorldDBKeys.nameFromKey(datakey);

            result.push({ name, data: await this._persistedData(name) });
        }

        return result;
    }

    protected async _persistedData(name: string) {
        const multi = this._batchedDiffs[name];

        if (multi) {
            await new Promise((resolve, reject) => multi.exec(Endpoint._promiseHandler(resolve, reject)));
        }

        return await new Promise((resolve, reject) =>
            this.redisClient.get(
                WorldDBKeys.data(name),

                Endpoint._bufferPromiseHandler(reply => resolve(reply ? API.DataRepo.decode(reply) : {}), reject),
            ),
        );
    }

    protected async _persistData(name: string, data: object) {
        await new Promise((resolve, reject) =>
            this.redisClient.set(
                WorldDBKeys.data(name),

                API.DataRepo.encode(data).toString('binary'),

                Endpoint._promiseHandler(resolve, reject),
            ),
        );
    }
}
