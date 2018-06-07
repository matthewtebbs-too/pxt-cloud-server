/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { Server, WorldAPI } from '..';

const debug = require('debug')('pxt-cloud:test');

function testWorldAPI(api: WorldAPI) {
    api.addUser({ name: 'Bobby Joe' }, debug);
    api.addUser({ name: 'Bobby Joe' }, debug);
    api.removeUser(debug);
    api.removeUser(debug);
}

Server.singleton.connect().then(server => testWorldAPI(server.worldAPI!)).catch(debug);
