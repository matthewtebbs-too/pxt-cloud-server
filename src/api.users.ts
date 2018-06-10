
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
    'add self'
    'remove self'
*/

export interface UsersAPI extends EventAPI {
    selfInfo(cb?: AckCallback<UserData>): boolean;
    addSelf(user: UserData, cb?: AckCallback<boolean>): boolean;
    removeSelf(cb?: AckCallback<boolean>): boolean;
}
