
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:api.base');

// tslint:disable-next-line:interface-name
export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T | any[] | undefined;
}

export type AckCallback<T> = (ack: Ack<T>) => void;

export function ackHandler<S, T>(cb?: AckCallback<T>, fn?: (reply?: S) => T) {
    return (err: Error | null = null, reply?: S) => {
        if (cb) {
            cb({ error: err, reply: fn ? fn(reply) : reply as any as T});
        }

        if (err) {
            debug(err);
        }
    };
}

// tslint:disable-next-line:interface-name
export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
