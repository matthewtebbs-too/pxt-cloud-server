import { AckCallback, EventAPI } from './api.base';
export declare type UserId = string;
export declare type UserData = {
    name: string;
};
export interface WorldAPI extends EventAPI {
    addUser(user: UserData, cb?: AckCallback<boolean>): boolean;
    removeUser(cb?: AckCallback<boolean>): boolean;
}
