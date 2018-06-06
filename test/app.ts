/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { Server, WorldAPI } from '..';

const debug = require('debug')('pxt-cloud:test');

const worldAPI = Server.worldAPI;
const sockid = '123456';

setTimeout(() => {
    worldAPI.addUser({ name: 'Bobby Joe' }, debug);
    worldAPI.addUser({ name: 'Bobby Joe' }, debug);
    worldAPI.removeUser(debug);
    worldAPI.removeUser(debug);
}, 500);
