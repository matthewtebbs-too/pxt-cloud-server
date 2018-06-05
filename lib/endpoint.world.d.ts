import { UserData, UserId, WorldAPI } from './api.world';
import { Endpoint } from './endpoint.base';
export declare const keys: {
    userId: (id: string) => string;
    users: string;
};
export declare class WorldEndpoint extends Endpoint implements WorldAPI {
    constructor(server: any);
    addUser(id: UserId, user: UserData): boolean;
    removeUser(id: UserId): boolean;
}
