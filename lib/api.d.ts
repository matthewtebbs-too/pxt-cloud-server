export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
export declare function namespaceEventAPI(nsp: string): string;
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
export declare const namespaceUsersAPI: string;
export interface MessageData {
    readonly text: string;
    readonly name?: string;
}
export interface ChatAPI extends EventAPI {
    newMessage(msg: string | MessageData): Promise<void>;
}
export declare const namespaceChatAPI: string;
export interface WorldAPI extends EventAPI {
}
export declare const namespaceWorldAPI: string;
export interface PublicAPI {
    readonly chat?: ChatAPI;
    readonly users?: UsersAPI;
    readonly world?: WorldAPI;
}
export declare function startServer(port?: number, host?: string): Promise<PublicAPI>;
