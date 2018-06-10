/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as PxtCloud from '..';

const debug = require('debug')('pxt-cloud:app');

function test(api: PxtCloud.PublicAPI) {
    api.users!.addSelf({ name: 'Billy Bob' }, debug);
    api.users!.selfInfo(debug);
}

PxtCloud.startServer().then(api => test(api)).catch(debug);