
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

// tslint:disable-next-line:variable-name
export const WorldEvents = {
    addUser: 'user add',
    removeUser: 'user remove',

    userJoined: 'user joined',
    userLeft: 'user left',
};

// tslint:disable-next-line:interface-name
export interface WorldAPI extends EventAPI {
    addUser(user: UserData, cb?: AckCallback<boolean>): boolean;
    removeUser(cb?: AckCallback<boolean>): boolean;
}
