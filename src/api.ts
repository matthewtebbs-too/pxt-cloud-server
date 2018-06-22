
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

const debug = require('debug')('pxt-cloud::server:api');

export interface EventAPI {
    isConnected: boolean;
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
    selfInfo(): PromiseLike<UserData>;
    addSelf(user: UserData): PromiseLike<boolean>;
    removeSelf(): PromiseLike<boolean>;
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
    newMessage(msg: string | MessageData): PromiseLike<void>;
}

export interface SyncedDataSource<T> {
    readonly data: T;
    readonly cloner?: (value: any) => any;
}

export interface SyncedData<T> {
    readonly source: SyncedDataSource<T>;
    timestamp?: string;
    latest?: T;
}

export interface WorldAPI extends EventAPI {
    addSyncedData<T>(name: string, source: SyncedDataSource<T>): boolean;
    removeSyncedData(name: string): boolean;

    syncData<T>(name: string): PromiseLike<string[]>;
    syncDiff(name: string, diff: any | any[] /* deep-diff's IDiff */): PromiseLike<string[]>;
}

export interface PublicAPI {
    readonly chat: ChatAPI;    /* namespace is 'pxt-cloud/chat' */
    readonly users: UsersAPI;  /* namespace is 'pxt-cloud/users' */
    readonly world: WorldAPI;  /* namespace is 'pxt-cloud/world' */
}
