import { ChatAPI } from './api.chat';
import { UsersAPI } from './api.users';
import { WorldAPI } from './api.world';
export interface EndpontMap {
    'chat': ChatAPI;
    'users': UsersAPI;
    'world': WorldAPI;
}
export interface ServerAPI {
    chatAPI: ChatAPI | null;
    usersAPI: UsersAPI | null;
    worldAPI: WorldAPI | null;
}
