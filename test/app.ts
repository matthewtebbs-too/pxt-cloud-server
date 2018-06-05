/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { ClientRedis, Server, WorldEndpoint } from '../lib';

const clientredis = ClientRedis.singleton;
const endpointWorld = new WorldEndpoint(Server.singleton);
