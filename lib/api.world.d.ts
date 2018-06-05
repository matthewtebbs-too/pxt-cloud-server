export declare type UserId = string;
export interface UserData {
    name: string;
}
export interface WorldAPI {
    addUser(id: UserId, user: UserData): boolean;
    removeUser(id: UserId): boolean;
}
