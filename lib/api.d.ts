export interface EventAPI {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
}
export declare type UserId = string;
export declare type UserData = {
    name: string;
};
export interface UsersAPI extends EventAPI {
    selfInfo(): Promise<UserData>;
    addSelf(user: UserData): Promise<boolean>;
    removeSelf(): Promise<boolean>;
}
export declare type MessageData = {
    name: string;
    text: string;
};
export interface ChatAPI extends EventAPI {
    newMessage(msg: string | MessageData): Promise<void>;
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
