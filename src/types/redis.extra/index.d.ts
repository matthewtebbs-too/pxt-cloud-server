/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as _ from 'redis';

declare module 'redis' {
    export type StreamID = string | '-' | '+';

    export interface Commands<R> {
        /***
         * Appends the specified stream entry to the stream at the specified key.
         */
        xadd: OverloadedSetCommand<string | number, string, R>;
        XADD: OverloadedSetCommand<string | number, string, R>;

        /**
         * Returns the number of entries inside a stream.
         */
        xlen(key: string, cb?: Callback<number>): R;
        XLEN(key: string, cb?: Callback<number>): R;

        /**
         * Returns the stream entries matching a given range of IDs.
         */
        xrange(key: string, start: StreamID, stop: StreamID, cb?: Callback<string[]>): R;
        XRANGE(key: string, start: StreamID, stop: StreamID, cb?: Callback<string[]>): R;
        xrange(key: string, start: StreamID, stop: StreamID, count: string, limit: number, cb?: Callback<string[]>): R;
        XRANGE(key: string, start: StreamID, stop: StreamID, count: string, limit: number, cb?: Callback<string[]>): R;
    
        /**
         * Returns in REVERSE order the stream entries matching a given range of IDs.
         */
        xrevrange(key: string, stop: StreamID, start: StreamID, cb?: Callback<string[]>): R;
        XREVRANGE(key: string, stop: StreamID, start: StreamID, cb?: Callback<string[]>): R;
        xrevrange(key: string, stop: StreamID, start: StreamID, count: string, limit: number, cb?: Callback<string[]>): R;
        XREVRANGE(key: string, stop: StreamID, start: StreamID, count: string, limit: number, cb?: Callback<string[]>): R;
    }
}
