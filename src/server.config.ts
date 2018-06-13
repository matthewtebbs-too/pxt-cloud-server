/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:server');

export class ServerConfig {
    public static host = process.env.PXT_CLOUD_HOST || 'localhost';
    public static port = process.env.PXT_CLOUD_PORT ? parseInt(process.env.PXT_CLOUD_PORT, 10) : 3000;

    public static redishost = process.env.PXT_CLOUD_REDISHOST || 'localhost';
    public static redisport = process.env.PXT_CLOUD_REDISPORT ? parseInt(process.env.PXT_CLOUD_REDISPORT, 10) : 6379;
}

debug(
`Configuration:-
    Host [PXT_CLOUD_HOST]:              ${ServerConfig.host}
    Port [PXT_CLOUD_PORT]:              ${ServerConfig.port}
    Redis host [PXT_CLOUD_REDISHOST]:   ${ServerConfig.redishost}
    Redis port [PXT_CLOUD_REDISPORT]:   ${ServerConfig.redisport}`);
