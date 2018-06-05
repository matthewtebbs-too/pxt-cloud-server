
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
    addUser(id: UserId, user: UserData): boolean;
    removeUser(id: UserId): boolean;
}
