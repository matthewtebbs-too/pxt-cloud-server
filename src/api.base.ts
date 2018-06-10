
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:api.base');

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

export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
