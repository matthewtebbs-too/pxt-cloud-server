export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T;
}
export declare type AckCallback<T> = (ack: Ack<T>) => void;
export declare function ackHandler<T>(cb?: AckCallback<T>): (error: Error | null, reply: T) => void;
export declare const ackHandlerVoid: (cb?: AckCallback<void> | undefined) => void;
export declare function mappedAckHandler<S, T>(map: (reply: S) => T, cb?: AckCallback<T>): (error: Error | null, reply: S) => void;
export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
export declare type UserId = string;
export declare type UserData = {
    name: string;
};
export interface UsersAPI extends EventAPI {
    selfInfo(cb?: AckCallback<UserData>): boolean;
    addSelf(user: UserData, cb?: AckCallback<boolean>): boolean;
    removeSelf(cb?: AckCallback<boolean>): boolean;
}
export declare type MessageData = {
    text: string;
};
export interface ChatAPI extends EventAPI {
    newMessage(msg: string | MessageData, cb?: AckCallback<void>): boolean;
}
export interface WorldAPI extends EventAPI {
}
export interface PublicAPI {
    public: PublicAPI | null;
    chat?: ChatAPI;
    users?: UsersAPI;
    world?: WorldAPI;
}
export declare function startServer(port?: number, host?: string): Promise<PublicAPI>;
