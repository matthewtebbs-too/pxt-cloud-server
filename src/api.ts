
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:api');

export interface Ack<T> {
    readonly error: Error | null;
    readonly reply?: T;
}

export type AckCallback<T> = (ack: Ack<T>) => void;

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
    selfInfo(cb?: AckCallback<UserData>): void;
    addSelf(user: UserData, cb?: AckCallback<boolean>): void;
    removeSelf(cb?: AckCallback<boolean>): void;

    selfInfoAsync(): Promise<UserData>;
    addSelfAsync(user: UserData): Promise<boolean>;
    removeSelfAsync(): Promise<boolean>;
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
    newMessage(msg: string | MessageData, cb?: AckCallback<void>): void;

    newMessageAsync(msg: string | MessageData): Promise<void>;
}

export interface WorldAPI extends EventAPI {
}

export interface PublicAPI {
    public: PublicAPI | null;

    chat?: ChatAPI;
    users?: UsersAPI;
    world?: WorldAPI;
}

export function ackHandler<T = void>(cb?: AckCallback<T>) {
    return (error: Error | null, reply?: T) => {
        if (cb) {
            cb({ error, reply });
        }

        if (error) {
            debug(error);
        }
    };
}

export function mappedAckHandler<S, T>(map: (reply: S) => T, cb?: AckCallback<T>) {
    return (error: Error | null, reply: S) => ackHandler(cb)(error, map(reply));
}

export function extractSocketFromArgs(args: any[]): [any[], any ] {
    let socket;

    if (args.length > 0) {
        const _socket = args[args.length - 1];

        if (undefined === _socket || (typeof _socket === 'object' && 'broadcast' in _socket)) {
            socket = _socket;

            args = args.slice(0, -1);
        }
    }

    return [ args, socket ];
}

export function promisefy<T>(thisArg: any, fn: (...args: any[]) => void, ...args_: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
        const [ args, socket ] = extractSocketFromArgs(args_);

        fn.call(thisArg, ...args, (ack: Ack<T>) => {
            if (!ack.error) {
                resolve(ack.reply);
            } else {
                reject(ack.error);
            }
        }, socket);
    });
}

export declare function startServer(port?: number, host?: string): Promise<PublicAPI>;
