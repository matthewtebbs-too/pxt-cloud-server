/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { ChatAPI } from './api.chat';
import { UsersAPI } from './api.users';
import { WorldAPI } from './api.world';

// tslint:disable-next-line:interface-name
export interface ServerAPI {
    chatAPI: ChatAPI | null;
    usersAPI: UsersAPI | null;
    worldAPI: WorldAPI | null;
}
