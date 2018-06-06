export interface Ack<T> {
    readonly error: Error | null;
    readonly reply: T;
}
export declare type Callback<T> = (ack: Ack<T>) => void;
export declare type UserId = string;
export declare type UserData = {
    name: string;
};
export interface WorldAPI {
    addUser(user: UserData, cb?: Callback<boolean>): boolean;
    removeUser(cb?: Callback<boolean>): boolean;
}
