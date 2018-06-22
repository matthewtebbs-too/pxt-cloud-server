export interface EventAPI {
    isConnected: boolean;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
export declare type UserId = string;
export interface UserData {
    readonly name: string;
    readonly id?: UserId;
}
export interface UsersAPI extends EventAPI {
    selfInfo(): PromiseLike<UserData>;
    addSelf(user: UserData): PromiseLike<boolean>;
    removeSelf(): PromiseLike<boolean>;
}
export interface MessageData {
    readonly text: string;
    readonly name?: string;
}
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
    syncDiff(name: string, diff: any | any[]): PromiseLike<string[]>;
}
export interface PublicAPI {
    readonly chat: ChatAPI;
    readonly users: UsersAPI;
    readonly world: WorldAPI;
}
