/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as PxtCloud from '..';

const debug = require('debug')('pxt-cloud:app');

function test(api: PxtCloud.UsersAPI) {
    api.addSelf({ name: 'Billy Bob' }, debug);
    api.selfInfo(debug);
}

PxtCloud.startServer().then(server => test(server.usersAPI!)).catch(debug);
