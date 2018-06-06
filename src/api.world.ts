
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:interface-name
// tslint:disable:interface-over-type-literal

export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T;
}

export type Callback<T> = (ack: Ack<T>) => void;

export type UserId = string;

export type UserData = {
    name: string;
};

export interface WorldAPI {
    addUser(user: UserData, cb?: Callback<boolean>): boolean;
    removeUser(cb?: Callback<boolean>): boolean;
}
