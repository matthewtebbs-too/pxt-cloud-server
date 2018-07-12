
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
};

export class WorldEndpoint extends Endpoint implements API.WorldAPI {
    protected _debug = debug;

    private _datarepo = new API.DataRepo();
    private _batchedDiffs: Redis.Multi;
    private _batchedCount = 0;

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(endpoints, redisClient, socketServer, 'world');

        this._batchedDiffs = redisClient.batch();
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
        await this._persistDiff(name, diff);

        this._notifyAndBroadcastEvent(API.Events.WorldSyncDataDiff, { name, diff }, socket);
    }

    protected _onClientConnect(socket: SocketIO.Socket) {
        super._onClientConnect(socket);

        socket
            .on(API.Events.WorldSyncDataDiff, ({ name, diff }, cb) =>
                Endpoint._fulfillReceivedEvent(this.syncDataDiff(name, diff, socket), cb));
    }

    protected async _persistDiff(name: string, diff: API.DataDiff[]) {
        const datakey = WorldDBKeys.dataDiff(name);

        this._batchedDiffs.rpush(datakey, API.DataRepo.encode(diff).toString('binary'));
    }

    protected async _persistedData(name: string) {
        await new Promise((resolve, reject) =>
            this._batchedDiffs.exec(Endpoint._defaultPromiseHandler(resolve, reject)),
        );

        return await new Promise((resolve, reject) => {
            const datakey = WorldDBKeys.data(name);

            this.redisClient.get(
                datakey,

                (error, reply) => {
                    if (!error) {
                        resolve(reply ? API.DataRepo.decode(Buffer.from(reply, 'binary')) : {});
                    } else {
                        reject(error);
                    }
                },
            );
        });
    }

    protected async _persistData(name: string, data: object) {
        await new Promise((resolve, reject) => {
            const datakey = WorldDBKeys.data(name);

            this.redisClient.set(
                datakey,

                API.DataRepo.encode(data).toString('binary'),

                Endpoint._defaultPromiseHandler(resolve, reject),
            );
        });
    }
}
