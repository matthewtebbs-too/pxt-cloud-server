/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as API from 'pxt-cloud-api';

import * as PxtCloudServer from '..';

const debug = require('debug')('pxt-cloud:server:test');

async function test(api: API.PublicAPI) {
    const data = {
        array: [] as number[],
        length: 0,
    };

    const datarepo = new API.DataRepo();

    datarepo.addDataSource('test', { data });

    debug('start');

    for (let index = 0; index < 1000; index++) {
        data.array.push(++index);
        data.length = index;

        const diff = datarepo.calcDataDiff('test');

        if (diff) {
            await api.world.syncDataDiff('test', diff);
        }
    }

    debug(await api.world.currentlySynced('test'));

    debug('end');
}

PxtCloudServer.startServer().then(async api => await test(api), debug);
