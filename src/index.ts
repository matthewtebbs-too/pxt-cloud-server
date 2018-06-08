/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { ChatAPI } from './api.chat';
import { UsersAPI } from './api.users';
import { WorldAPI } from './api.world';

export * from './api.base';
export * from './api.chat';
export * from './api.users';
export * from './api.world';

// tslint:disable-next-line:interface-name
export interface ServerAPI {
    chatAPI: ChatAPI | null;
    usersAPI: UsersAPI | null;
    worldAPI: WorldAPI | null;
}

export declare function startServer(port?: number, host?: string): Promise<ServerAPI>;
