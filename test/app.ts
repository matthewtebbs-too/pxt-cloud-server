/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as PxtCloud from '..';

const debug = require('debug')('pxt-cloud:app');

function test(api: PxtCloud.PublicAPI) {
    api.users!.addSelfAsync({ name: 'Billy Bob' }).then(debug).catch(debug);
    api.users!.selfInfoAsync().then(debug).catch(debug);
    api.chat!.newMessageAsync('hello world!').then(debug).catch(debug);
}

PxtCloud.startServer().then(api => test(api)).catch(debug);
