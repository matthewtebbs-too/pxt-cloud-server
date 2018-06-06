
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:interface-name

export type UserId = string;

export interface UserData {
    name: string;
}

export interface WorldAPI {
    addUser(user: UserData, id?: UserId): boolean;
    removeUser(id?: UserId): boolean;
}
