
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:interface-name
// tslint:disable:interface-over-type-literal

import { AckCallback } from './api.base';

export type UserId = string;

export type UserData = {
    name: string;
};

export interface WorldAPI {
    addUser(user: UserData, cb?: AckCallback<boolean>): boolean;
    removeUser(cb?: AckCallback<boolean>): boolean;
}
