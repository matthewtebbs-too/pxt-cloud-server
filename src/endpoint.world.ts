/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

/// <reference types='redis.extra' />

import * as API from 'pxt-cloud-api';

import { Endpoint, EndpointDBKeys, Endpoints } from './endpoint_';

const debug = require('debug')('pxt-cloud:endpoint:world');

// tslint:disable-next-line:variable-name
const WorldDBKeys = {
    data: (name: string) => `data:${name}`,
    dataDiff: (name: string) => `diff:${name}`,

    nameFromKey: (key: string) => key.substr(key.indexOf(':') + 1),
};

export class WorldEndpoint extends Endpoint implements API.WorldAPI {
    public static maxExecBatchedDiffs = 25;  /* batch max 25 commands */
    public static factorStreamDiffs = 3;     /* allow 'factor' times flush batched diffs before applied to data */

    protected _debug = debug;

    private _datarepo = new API.DataRepo();
    private _batchedDiffs: { [key: string]: Redis.Multi } = {};

    constructor(
        endpoints: Endpoints,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
    ) {
        super(endpoints, redisClient, socketServer, 'world');
    }

    public async syncDataSources() {
        return true;
    }

    public setDataSource(name: string, source: API.DataSource): boolean {
        return this._datarepo.setDataSource(name, source);
    }

    public deleteDataSource(name: string): boolean {
        return this._datarepo.deleteDataSource(name);
    }

    public async pullAllData(socket?: SocketIO.Socket) {
        const tencdata = await this._pullAllData(socket);

        return tencdata.map(({ name, data /* encdata */}) => ({ name, data: API.DataRepo.decode(data) }));
    }

    public async pullData(name: string, socket?: SocketIO.Socket) {
        return API.DataRepo.decode(await this._pullData(name, socket));
    }

    public async pushAllData(socket?: SocketIO.Socket) {
        this._datarepo.names.forEach(async (name: string) =>
            await this.pushData(name, socket),
        );
    }

    public async pushData(name: string, socket?: SocketIO.Socket) {
        const diff = this._datarepo.calcDataDiff(name);

        if (diff) {
            await this.pushDataDiff(name, diff, socket);
        }
    }

    public async pushDataDiff(name: string, diff: API.DataDiff[], socket?: SocketIO.Socket) {
        const encdiff = API.DataRepo.encodeArray(diff);

        await this._pushDataDiff(name, encdiff);
    }

    protected async _initializeClient(socket?: SocketIO.Socket) {
        const success = await super._initializeClient(socket);

        if (success) {
            if (socket) {
                socket
                    .on(API.Events.WorldPullAllData, cb =>
                        Endpoint._fulfillReceivedEvent(this._pullAllData(socket), cb))

                    .on(API.Events.WorldPullData, (name, cb) =>
                        Endpoint._fulfillReceivedEvent(this._pullData(name, socket), cb))

                    .on(API.Events.WorldPushAllData, (tencdata, cb) =>
                        Endpoint._fulfillReceivedEvent(this._pushAllData(tencdata, socket), cb))

                    .on(API.Events.WorldPushData, ({ name, encdata }, cb) =>
                        Endpoint._fulfillReceivedEvent(this._pushData(name, encdata, socket), cb))

                    .on(API.Events.WorldPushDataDiff, ({ name, encdiff }, cb) =>
                        Endpoint._fulfillReceivedEvent(this._pushDataDiff(name, encdiff, socket), cb))

                    .on(API.Events.WorldLockData, (name, cb) =>
                        Endpoint._fulfillReceivedEvent(this._lockData(name, socket), cb))

                    .on(API.Events.WorldUnlockData, (name, cb) =>
                        Endpoint._fulfillReceivedEvent(this._unlockData(name, socket), cb));
            }
        }

        return success;
    }

    protected async _pullAllData(socket?: SocketIO.Socket) {
        // const datakeys = await new Promise<string[]>((resolve, reject) => {
        //     return this.redisClient.keys(WorldDBKeys.data('*'), Endpoint._promiseHandler(resolve, reject));
        // });

        const datakeys = ['hack:globals'];
        const tencdata: Array<API.Tagged<Buffer>> = [];

        for (const datakey of datakeys) {
            const name = WorldDBKeys.nameFromKey(datakey);

            tencdata.push({ name, data: await this._pullData(name) });
        }

        return tencdata;
    }

    protected async _pullData(name: string, socket?: SocketIO.Socket) {
        const multi = this._batchedDiffs[name];

        if (multi) {
            await new Promise((resolve, reject) => multi.exec(Endpoint._promiseHandler(resolve, reject)));
        }

        let encdata = await new Promise<Buffer>((resolve, reject) =>
            this.redisClient.get(
                WorldDBKeys.data(name),

                Endpoint._binaryPromiseHandler(resolve, reject),
            ),
        );

        const encdiff = await this._pullDataDiff(name);

        if (encdiff && encdiff.length > 0) {
            let current = encdata ? API.DataRepo.decode(encdata) : {};

            current = API.DataRepo.applyDataDiff(current, API.DataRepo.decode(encdiff));
            encdata = API.DataRepo.encode(current) as Buffer;

            await this._pushData(name, encdata, socket);

            await this._deleteAllPushedDiff(name);
        }

        return encdata;
    }

    protected async _pullDataDiff(name: string, socket?: SocketIO.Socket) {
        return await new Promise<Buffer[]>((resolve, reject) =>
            this.redisClient.xrange(
                WorldDBKeys.dataDiff(name),

                '-', '+',

                Endpoint._promiseHandler(reply => {
                    if (reply && reply.length > 0) {
                        const idFirst = reply[0][0];
                        const idLast = reply[reply.length - 1][0];

                        const encdiff: Buffer[] = [];

                        reply.forEach((entry: Redis.StreamEntry) => {
                            const ikvBlob = entry[1].findIndex(value => value === EndpointDBKeys.blob);

                            if (-1 !== ikvBlob && ikvBlob < (entry[1].length - 1)) {
                                encdiff.push(Buffer.from(entry[1][ikvBlob + 1], 'binary'));
                            }
                        });

                        resolve(encdiff);
                    } else {
                        resolve();
                    }
                }, reject),
            ),
        );
    }

    protected async _pushAllData(tencdata: Array<API.Tagged<Buffer>>, socket?: SocketIO.Socket) {
        tencdata.forEach(async ({ name, data /* encdata */ }) =>
            await this._pushData(name, data, socket),
        );
    }

    protected async _pushData(name: string, encdata: Buffer, socket?: SocketIO.Socket) {
        await new Promise((resolve, reject) =>
            this.redisClient.set(
                WorldDBKeys.data(name),

                encdata.toString('binary'),

                Endpoint._promiseHandler(resolve, reject),
            ),
        );
    }

    protected async _pushDataDiff(name: string, encdiff: Buffer[], socket?: SocketIO.Socket) {
        let multi = this._batchedDiffs[name];
        if (!multi) {
            multi = this._batchedDiffs[name] = this.redisClient.batch();
        }

        const datadiffKey = WorldDBKeys.dataDiff(name);

        encdiff.forEach(d => multi.xadd(datadiffKey, '*', EndpointDBKeys.blob, d.toString('binary')));

        if (multi.queue.length >= WorldEndpoint.maxExecBatchedDiffs) {
            await new Promise((resolve, reject) => multi.exec(Endpoint._promiseHandler(resolve, reject)));

            const lenDiff = await new Promise((resolve, reject) => this.redisClient.xlen(datadiffKey, Endpoint._promiseHandler(resolve, reject)));

            if (lenDiff >= (WorldEndpoint.maxExecBatchedDiffs * WorldEndpoint.factorStreamDiffs)) {
                /* ignore return value */ await this._pullData(name);
            }
        }

        await this._notifyEvent(API.Events.WorldPushDataDiff, { name, encdiff }, socket);
    }

    protected async _deleteAllPushedDiff(name: string) {
        await new Promise((resolve, reject) => this.redisClient.del(WorldDBKeys.dataDiff(name), Endpoint._promiseHandler(resolve, reject)));
    }

    protected async _lockData(name: string, socket?: SocketIO.Socket) {
        return !!this._resourceLock(WorldDBKeys.data(name));
    }

    protected async _unlockData(name: string, socket?: SocketIO.Socket) {
        return !!this._resourceUnlock(WorldDBKeys.data(name));
    }
}
