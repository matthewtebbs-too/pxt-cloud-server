/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as API from 'pxt-cloud-api';

import * as PxtCloudServer from '..';

const debug = require('debug')('pxt-cloud:server:test');

PxtCloudServer.startServer().then(debug, debug);
