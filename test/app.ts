/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as PxtCloud from '..';

const debug = require('debug')('pxt-cloud:test');

function run(api: PxtCloud.PublicAPI) {
    // const mydata = {
    //     a: [1, 2, 3],
    //     n: 42,
    //     s: 'Joe',
    // };

    // api.world.addSyncedData('foo', { data: mydata });

    // api.world.syncData('foo').then(debug, debug);

    // mydata.s = 'Billy';

    // api.world.syncData('foo').then(debug, debug);

    // mydata.a = mydata.a.concat(4);

    // api.world.syncData('foo').then(debug, debug);
}

PxtCloud.startServer().then(run, debug);
