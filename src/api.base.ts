
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

// tslint:disable:interface-name
// tslint:disable:interface-over-type-literal

const debug = require('debug')('pxt-cloud:api.base');

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
