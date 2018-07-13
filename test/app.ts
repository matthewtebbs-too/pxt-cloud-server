/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as API from 'pxt-cloud-api';

import * as PxtCloudServer from '..';

const debug = require('debug')('pxt-cloud:server:test');

async function run(api: API.PublicAPI) {
    /* do nothing */
}

PxtCloudServer.startServer().then(async api => await run(api), debug);
