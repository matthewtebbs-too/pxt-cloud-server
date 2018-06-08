import { ChatAPI } from './api.chat';
import { UsersAPI } from './api.users';
import { WorldAPI } from './api.world';
export * from './api.base';
export * from './api.chat';
export * from './api.users';
export * from './api.world';
export interface ServerAPI {
    chatAPI: ChatAPI | null;
    usersAPI: UsersAPI | null;
    worldAPI: WorldAPI | null;
}
export declare function startServer(port?: number, host?: string): Promise<ServerAPI>;
