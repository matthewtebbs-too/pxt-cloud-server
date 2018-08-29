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

    public async dispose() {
        await this._flushAllBatchedDiffs(true);
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

    public async pushAllData(
        unlock: boolean = false,
        socket?: SocketIO.Socket,
    ) {
        this._datarepo.names.forEach(async (name: string) =>
            await this.pushData(name, false, socket),
        );

        if (unlock) {
            await this.unlockData('*');
        }
    }

    public async pushData(
        name: string,
        unlock: boolean = false,
        socket?: SocketIO.Socket,
    ) {
        const diff = this._datarepo.calcDataDiff(name);

        await this.pushDataDiff(name, diff, unlock, socket);
    }

    public async pushDataDiff(
        name: string,
        diff: API.DataDiff[] | undefined,
        unlock: boolean = false,
        socket?: SocketIO.Socket,
    ) {
        if (diff && diff.length > 0) {
            await this._pushDataDiff(name, API.DataRepo.encodeArray(diff), unlock, socket);
        } else if (unlock) {
            await this.unlockData(name);
        }
    }

    public async lockData(name: string, socket?: SocketIO.Socket) {
        return await this._lockData(name, socket);
    }

    public async unlockData(name: string, socket?: SocketIO.Socket) {
        return await this._unlockData(name, socket);
    }

    protected _getBatchedDiff(name: string) {
        let multi = this._batchedDiffs[name];

        const batchExisted = !!multi;

        if (!batchExisted) {
            multi = this._batchedDiffs[name] = this.redisClient.batch();
        }

        return { multi, batchExisted };
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

                    .on(API.Events.WorldPushAllData, ({ tencdata, unlock }, cb) =>
                        Endpoint._fulfillReceivedEvent(this._pushAllData(tencdata, unlock, socket), cb))

                    .on(API.Events.WorldPushData, ({ name, encdata, unlock }, cb) =>
                        Endpoint._fulfillReceivedEvent(this._pushData(name, encdata, unlock, socket), cb))

                    .on(API.Events.WorldPushDataDiff, ({ name, encdiff, unlock }, cb) =>
                        Endpoint._fulfillReceivedEvent(this._pushDataDiff(name, encdiff, unlock, socket), cb))

                    .on(API.Events.WorldLockData, (name, cb) =>
                        Endpoint._fulfillReceivedEvent(this._lockData(name, socket), cb))

                    .on(API.Events.WorldUnlockData, (name, cb) =>
                        Endpoint._fulfillReceivedEvent(this._unlockData(name, socket), cb));
            }
        }

        return success;
    }

    protected async _pullAllData(socket?: SocketIO.Socket) {
        const datakeys = await new Promise<string[]>((resolve, reject) => {
            return this.redisClient.keys(WorldDBKeys.data('*'), Endpoint._promiseHandler(resolve, reject));
        });

        const tencdata: Array<API.Tagged<Buffer>> = [];

        for (const datakey of datakeys) {
            const name = WorldDBKeys.nameFromKey(datakey);

            tencdata.push({ name, data: await this._pullData(name) });
        }

        return tencdata;
    }

    protected async _pullData(name: string, socket?: SocketIO.Socket) {
        const { multi } = this._getBatchedDiff(name);

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
            encdata = API.DataRepo.encode(current);

            await this._pushData(name, encdata, false, socket);

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

    protected async _pushAllData(
        tencdata: Array<API.Tagged<Buffer>>,
        unlock: boolean = false,
        socket?: SocketIO.Socket,
    ) {
        tencdata.forEach(async ({ name, data /* encdata */ }) =>
            await this._pushData(name, data, false, socket),
        );

        if (unlock) {
            await this._unlockData('*');
        }
    }

    protected async _pushData(
        name: string,
        encdata: Buffer,
        unlock: boolean = false,
        socket?: SocketIO.Socket,
    ) {
        await new Promise((resolve, reject) =>
            this.redisClient.set(
                WorldDBKeys.data(name),

                encdata.toString('binary'),

                Endpoint._promiseHandler(resolve, reject),
            ),
        );

        if (unlock) {
            await this._unlockData(name);
        }
    }

    protected async _pushDataDiff(
        name: string,
        encdiff: Buffer[],
        unlock: boolean = false,
        socket?: SocketIO.Socket,
    ) {
        const { multi, batchExisted } = this._getBatchedDiff(name);

        const datadiffKey = WorldDBKeys.dataDiff(name);

        encdiff.forEach(d => multi.xadd(datadiffKey, '*', EndpointDBKeys.blob, d.toString('binary')));

        await this._flushBatchedDiffs(name, !batchExisted);

        await this._notifyEvent(API.Events.WorldPushDataDiff, { name, encdiff }, socket);

        if (unlock) {
            await this._unlockData(name);
        }
    }

    protected async _flushAllBatchedDiffs(forceFlush: boolean = false) {
        this._datarepo.names.forEach(async (name: string) =>
            await this._flushBatchedDiffs(name),
        );
    }

    protected async _flushBatchedDiffs(name: string, forceFlush: boolean = false) {
        const { multi } = this._getBatchedDiff(name);

        const datadiffKey = WorldDBKeys.dataDiff(name);

        if (forceFlush || (multi.queue.length >= WorldEndpoint.maxExecBatchedDiffs)) {
            await new Promise((resolve, reject) => multi.exec(Endpoint._promiseHandler(resolve, reject)));

            const lenDiff = await new Promise((resolve, reject) => this.redisClient.xlen(datadiffKey, Endpoint._promiseHandler(resolve, reject)));

            if (forceFlush || (lenDiff >= (WorldEndpoint.maxExecBatchedDiffs * WorldEndpoint.factorStreamDiffs))) {
                /* ignore return value */ await this._pullData(name);
            }
        }
    }

    protected async _deleteAllPushedDiff(name: string) {
        await new Promise((resolve, reject) => this.redisClient.del(WorldDBKeys.dataDiff(name), Endpoint._promiseHandler(resolve, reject)));
    }

    protected async _lockData(name: string, socket?: SocketIO.Socket) {
        return undefined !== await this._resourceLock(WorldDBKeys.data(name));
    }

    protected async _unlockData(name: string, socket?: SocketIO.Socket) {
        return undefined !== await this._resourceUnlock(WorldDBKeys.data(name));
    }
}
