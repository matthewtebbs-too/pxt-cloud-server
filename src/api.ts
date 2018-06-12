
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:api');

export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export type UserId = string;

export interface UserData {
    readonly name: string;

    readonly id?: UserId;   /* reply only */
}

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

export interface MessageData {
    readonly text: string;

    readonly name?: string; /* reply only */
}

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
    readonly chat?: ChatAPI;    /* namespace is 'pxt-cloud/chat' */
    readonly users?: UsersAPI;  /* namespace is 'pxt-cloud/users' */
    readonly world?: WorldAPI;  /* namespace is 'pxt-cloud/world' */

    readonly dispose?: () => void;
}

export declare function startServer(port?: number, host?: string): Promise<PublicAPI>;
