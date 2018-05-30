/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

export class ServerConfig {
    public static hostname = process.env.PXT_CLOUD_HOSTNAME || 'localhost';
    public static port = process.env.PXT_CLOUD_PORT ? parseInt(process.env.PXT_CLOUD_PORT, 10) : 3000;

    public static get defaultUri() {
        return `http://${ServerConfig.hostname}:${ServerConfig.port}`;
    }
}
