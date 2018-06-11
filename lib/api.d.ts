export interface Ack<T> {
    readonly error: Error | null;
    readonly reply?: T;
}
export declare type AckCallback<T> = (ack: Ack<T>) => void;
export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
export declare type UserId = string;
export declare type UserData = {
    name: string;
};
export interface UsersAPI extends EventAPI {
    selfInfo(cb?: AckCallback<UserData>): void;
    addSelf(user: UserData, cb?: AckCallback<boolean>): void;
    removeSelf(cb?: AckCallback<boolean>): void;
    selfInfoAsync(): Promise<UserData>;
    addSelfAsync(user: UserData): Promise<boolean>;
    removeSelfAsync(): Promise<boolean>;
}
export declare type MessageData = {
    text: string;
};
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
export declare function ackHandler<T = void>(cb?: AckCallback<T>): (error: Error | null, reply?: T | undefined) => void;
export declare function mappedAckHandler<S, T>(map: (reply: S) => T, cb?: AckCallback<T>): (error: Error | null, reply: S) => void;
export declare function extractSocketFromArgs(args: any[]): [any[], any];
export declare function promisefy<T>(thisArg: any, fn: (...args: any[]) => void, ...args_: any[]): Promise<T>;
export declare function startServer(port?: number, host?: string): Promise<PublicAPI>;
