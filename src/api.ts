
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:api');

export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

export function namespaceEventAPI(nsp: string) {
    return `pxt-cloud/${nsp}`;
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

export const namespaceUsersAPI = namespaceEventAPI('users');

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

export const namespaceChatAPI = namespaceEventAPI('chat');

export interface WorldAPI extends EventAPI {
}

export const namespaceWorldAPI = namespaceEventAPI('world');

export interface PublicAPI {
    readonly chat?: ChatAPI;
    readonly users?: UsersAPI;
    readonly world?: WorldAPI;
}

export declare function startServer(port?: number, host?: string): Promise<PublicAPI>;
