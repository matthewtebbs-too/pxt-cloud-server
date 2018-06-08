import { AckCallback, EventAPI } from './api.base';
export declare type UserId = string;
export declare type UserData = {
    name: string;
};
export interface UsersAPI extends EventAPI {
    selfInfo(cb?: AckCallback<UserData>): boolean;
    addSelf(user: UserData, cb?: AckCallback<boolean>): boolean;
    removeSelf(cb?: AckCallback<boolean>): boolean;
}
