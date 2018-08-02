/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import Queue = require('double-ended-queue');
import 'redis';

declare module 'redis' {
    /*
        Redis 5.0 commands below require muddytummy/redis-commands package.
    */
    export type StreamID = string | '-' | '+';

    export type StreamEntry = [string /* id */, string[] /* kv pairs */];

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
        xrange(key: string, start: StreamID, stop: StreamID, cb?: Callback<StreamEntry[]>): R;
        XRANGE(key: string, start: StreamID, stop: StreamID, cb?: Callback<StreamEntry[]>): R;
        xrange(key: string, start: StreamID, stop: StreamID, count: string, limit: number, cb?: Callback<StreamEntry[]>): R;
        XRANGE(key: string, start: StreamID, stop: StreamID, count: string, limit: number, cb?: Callback<StreamEntry[]>): R;
    
        /**
         * Returns in REVERSE order the stream entries matching a given range of IDs.
         */
        xrevrange(key: string, stop: StreamID, start: StreamID, cb?: Callback<StreamEntry[]>): R;
        XREVRANGE(key: string, stop: StreamID, start: StreamID, cb?: Callback<StreamEntry[]>): R;
        xrevrange(key: string, stop: StreamID, start: StreamID, count: string, limit: number, cb?: Callback<StreamEntry[]>): R;
        XREVRANGE(key: string, stop: StreamID, start: StreamID, count: string, limit: number, cb?: Callback<StreamEntry[]>): R;
    }

    export interface Multi {
        queue: Queue<any>;
    }
}
