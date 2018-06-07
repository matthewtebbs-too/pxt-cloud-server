/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { Server } from '..';

const debug = require('debug')('pxt-cloud:test');

function test() {
    Server.worldAPI!.addUser({ name: 'Bobby Joe' }, debug);
    Server.worldAPI!.addUser({ name: 'Bobby Joe' }, debug);
    Server.worldAPI!.removeUser(debug);
    Server.worldAPI!.removeUser(debug);
}

Server.singleton.connect().then(test).catch(debug);
