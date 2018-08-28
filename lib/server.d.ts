import * as API from 'pxt-cloud-api';
export * from './server.config';
export declare function startServer(port?: number, host?: string): Promise<{
    chat: API.ChatAPI;
    users: API.UsersAPI;
    world: API.WorldAPI;
}>;
export declare function disposeServer(): Promise<void>;
