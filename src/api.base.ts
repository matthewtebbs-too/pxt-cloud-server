
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud:api.base');

// tslint:disable-next-line:interface-name
export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T | any[];
}

export type AckCallback<T> = (ack: Ack<T>) => void;

export function ackHandler<T>(fn?: (reply: T | any[]) => T, cb?: AckCallback<T>) {
    return (err: Error | null, reply: any[]) => {
        if (cb) {
            cb({ error: err, reply: fn ? fn(reply) : reply });
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
