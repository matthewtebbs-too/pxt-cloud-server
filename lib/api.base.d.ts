export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T | any[] | undefined;
}
export declare type AckCallback<T> = (ack: Ack<T>) => void;
export declare function ackHandler<T>(cb?: AckCallback<T>, fn?: (reply?: T | any[]) => T): (err?: Error | null, reply?: any[] | undefined) => void;
export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
