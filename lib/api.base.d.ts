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
