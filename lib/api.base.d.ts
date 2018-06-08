export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T | any[] | undefined;
}
export declare type AckCallback<T> = (ack: Ack<T>) => void;
export declare function ackHandler<S, T>(cb?: AckCallback<T>, fn?: (reply?: S) => T): (err?: Error | null, reply?: S | undefined) => void;
export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
