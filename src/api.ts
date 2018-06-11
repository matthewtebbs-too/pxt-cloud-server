
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:api');

export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

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
    selfInfo(): Promise<UserData>;
    addSelf(user: UserData): Promise<boolean>;
    removeSelf(): Promise<boolean>;
}

// tslint:disable-next-line:interface-over-type-literal
export type MessageData = {
    name: string;
    text: string;
};

/*
    Events:-

    'new message'
*/

export interface ChatAPI extends EventAPI {
    newMessage(msg: string | MessageData): Promise<void>;
}

export interface WorldAPI extends EventAPI {
}

export interface PublicAPI {
    public: PublicAPI | null;

    chat?: ChatAPI;
    users?: UsersAPI;
    world?: WorldAPI;
}

export declare function startServer(port?: number, host?: string): Promise<PublicAPI>;
