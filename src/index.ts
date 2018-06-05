/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

export * from './client.redis';
export * from './endpoint.base';
export * from './endpoint.world';
export * from './server';
export * from './server.config';

import { ClientRedis } from './client.redis';
import { Server } from './server';

process.on('SIGINT', () => {
    ClientRedis.singleton.dispose();
    Server.singleton.dispose();
});
