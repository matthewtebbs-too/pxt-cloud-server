export declare namespace API {
    enum Events {
        ChatNewMessage = "new message",
        UserAddSelf = "add self",
        UserLeft = "user left",
        UserJoined = "user joined",
        UserRemoveSelf = "remove self",
        UserSelfInfo = "self info"
    }
    interface CommonAPI {
        isConnected: boolean;
        on(event: string | symbol, listener: (...args: any[]) => void): this;
        off(event: string | symbol, listener: (...args: any[]) => void): this;
    }
    type UserId = string;
    interface UserData {
        readonly name: string;
        readonly id?: UserId;
    }
    interface UsersAPI extends CommonAPI {
        selfInfo(): PromiseLike<UserData>;
        addSelf(user: UserData): PromiseLike<boolean>;
        removeSelf(): PromiseLike<boolean>;
    }
    interface MessageData {
        readonly text: string;
        readonly name?: string;
    }
    interface ChatAPI extends CommonAPI {
        newMessage(msg: string | MessageData): PromiseLike<void>;
    }
    interface SyncedDataSource<T> {
        readonly data: T;
        readonly cloner?: (value: any) => any;
    }
    interface SyncedData<T> {
        readonly source: SyncedDataSource<T>;
        timestamp?: string;
        latest?: T;
    }
    interface WorldAPI extends CommonAPI {
    }
    interface PublicAPI {
        readonly chat: ChatAPI;
        readonly users: UsersAPI;
        readonly world: WorldAPI;
    }
}
