/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as PxtCloud from '..';

const debug = require('debug')('pxt-cloud:test');

function run(api: PxtCloud.PublicAPI) {
    /* do nothing */
}

PxtCloud.startServer().then(run, debug);
