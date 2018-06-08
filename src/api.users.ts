
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { AckCallback, EventAPI } from './api.base';

export type UserId = string;

// tslint:disable-next-line:interface-over-type-literal
export type UserData = {
    name: string;
};

/*
    Events:-

    'user joined'
    'user left'
    'add user'
    'remove user'
*/

// tslint:disable-next-line:interface-name
export interface UsersAPI extends EventAPI {
    addUser(user: UserData, cb?: AckCallback<boolean>): boolean;
    removeUser(cb?: AckCallback<boolean>): boolean;
}
