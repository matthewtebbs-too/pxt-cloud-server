/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as PxtCloud from '..';

const debug = require('debug')('pxt-cloud:test');

function test(api: PxtCloud.PublicAPI) {
    api.users!.addSelf({ name: 'Billy Bob' }).then(value => debug(`user existed: %d`, value), debug);
    api.users!.selfInfo().then(value => debug(`user: %o`, value), debug);
    api.chat!.newMessage('hello world!').then(debug(`message sent`), debug);
}

PxtCloud.startServer().then(test, debug);
