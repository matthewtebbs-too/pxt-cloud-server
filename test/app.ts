/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { Server, WorldAPI } from '../lib';

const worldAPI = Server.worldAPI;

const userId = '123456';

setTimeout(() => {
    worldAPI.addUser({ name: 'Bobby Joe' }, userId);
    worldAPI.removeUser(userId);
}, 500);
