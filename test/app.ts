/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { Server, WorldAPI } from '..';

const debug = require('debug')('pxt-cloud:test');

const worldAPI = Server.worldAPI;
const userId = '123456';

setTimeout(() => {
    worldAPI.addUser({ name: 'Bobby Joe' }, userId, reply => debug(reply));
    worldAPI.addUser({ name: 'Bobby Joe' }, userId, reply => debug(reply));
    worldAPI.removeUser(userId, reply => debug(reply));
    worldAPI.removeUser(userId, reply => debug(reply));
}, 500);
