/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as PxtCloud from '..';

const debug = require('debug')('pxt-cloud:test');

function testWorldAPI(api: PxtCloud.WorldAPI) {
    api.on('user joined', debug);
    api.on('user left', debug);

    api.addUser({ name: 'Bobby Joe' }, debug);
    api.addUser({ name: 'Bobby Joe' }, debug);

    api.removeUser(debug);
    api.removeUser(debug);
}

PxtCloud.startServer().then(server => testWorldAPI(server.worldAPI!)).catch(debug);
