
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:api');

export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T;
}

export type AckCallback<T> = (ack: Ack<T>) => void;

export function ackHandler<T>(cb?: AckCallback<T>) {
    return (error: Error | null, reply: T) => {
        if (cb) {
            cb({ error, reply });
        }

        if (error) {
            debug(error);
        }
    };
}

export const ackHandlerVoid = (cb?: AckCallback<void>) => ackHandler(cb)(null, undefined);

export function mappedAckHandler<S, T>(map: (reply: S) => T, cb?: AckCallback<T>) {
    return (error: Error | null, reply: S) => ackHandler(cb)(error, map(reply));
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
    selfInfo(cb?: AckCallback<UserData>): boolean;
    addSelf(user: UserData, cb?: AckCallback<boolean>): boolean;
    removeSelf(cb?: AckCallback<boolean>): boolean;
}

export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}

// tslint:disable-next-line:interface-over-type-literal
export type MessageData = {
    text: string;
};

/*
    Events:-

    'new message'
*/

export interface ChatAPI extends EventAPI {
    newMessage(msg: string | MessageData, cb?: AckCallback<void>): boolean;
}

export interface WorldAPI extends EventAPI {
}

export interface EndpontMap {
    'chat': ChatAPI;
    'users': UsersAPI;
    'world': WorldAPI;
}

export interface ServerAPI {
    //endpoint<T extends keyof EndpontMap>(name: T): EndpontMap[T];
    chatAPI: ChatAPI | null;
    usersAPI: UsersAPI | null;
    worldAPI: WorldAPI | null;
}

export interface ServerAPI {
    chatAPI: ChatAPI | null;
    usersAPI: UsersAPI | null;
    worldAPI: WorldAPI | null;
}

export declare function startServer(port?: number, host?: string): Promise<ServerAPI>;
