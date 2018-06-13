/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

export class ServerConfig {
    public static host = process.env.PXT_CLOUD_HOST || 'localhost';
    public static port = process.env.PXT_CLOUD_PORT ? parseInt(process.env.PXT_CLOUD_PORT, 10) : 3000;

    public static redishost = process.env.PXT_CLOUD_REDISHOST || 'localhost';
    public static redisport = process.env.PXT_CLOUD_REDISPORT ? parseInt(process.env.PXT_CLOUD_REDISPORT, 10) : 6379;
}
