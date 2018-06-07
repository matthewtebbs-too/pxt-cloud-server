export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T | any[];
}
export declare type AckCallback<T> = (ack: Ack<T>) => void;
export declare function ackHandler<T>(fn?: (reply: T | any[]) => T, cb?: AckCallback<T>): (err: Error | null, reply: any[]) => void;
export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
