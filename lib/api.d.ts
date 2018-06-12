export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
export declare type UserId = string;
export interface UserData {
    readonly name: string;
    readonly id?: UserId;
}
export interface UsersAPI extends EventAPI {
    selfInfo(): Promise<UserData>;
    addSelf(user: UserData): Promise<boolean>;
    removeSelf(): Promise<boolean>;
}
export interface MessageData {
    readonly text: string;
    readonly name?: string;
}
export interface ChatAPI extends EventAPI {
    newMessage(msg: string | MessageData): Promise<void>;
}
export interface WorldAPI extends EventAPI {
}
export interface PublicAPI {
    readonly chat?: ChatAPI;
    readonly users?: UsersAPI;
    readonly world?: WorldAPI;
    readonly dispose?: () => void;
}
export declare function startServer(port?: number, host?: string): Promise<PublicAPI>;
export declare function disposeServer(): void;
