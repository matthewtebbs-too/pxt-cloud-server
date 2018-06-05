/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { Server, WorldAPI } from '../lib';

const worldAPI = Server.worldAPI;

const userId = '123456';

setTimeout(() => {
    worldAPI.addUser(userId, { name: 'Bobby Joe' });
    worldAPI.removeUser(userId);
}, 500);
