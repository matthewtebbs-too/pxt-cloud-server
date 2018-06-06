export declare type UserId = string;
export interface UserData {
    name: string;
}
export interface WorldAPI {
    addUser(user: UserData, id?: UserId): boolean;
    removeUser(id?: UserId): boolean;
}
