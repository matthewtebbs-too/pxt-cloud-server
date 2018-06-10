/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { ChatAPI } from './api.chat';
import { UsersAPI } from './api.users';
import { WorldAPI } from './api.world';

export interface EndpontMap {
    'chat': ChatAPI;
    'users': UsersAPI;
    'world': WorldAPI;
}

export interface ServerAPI {
    //endpoint<T extends keyof EndpontMap>(name: T): EndpontMap[T];
    chatAPI: ChatAPI | null;
    usersAPI: UsersAPI | null;
    worldAPI: WorldAPI | null;
}
