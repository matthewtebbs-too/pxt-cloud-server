import { PublicAPI } from './api';
import { Endpoint } from './endpoint_';
export declare type PrivateAPI = {
    [E in keyof PublicAPI]: Endpoint | null;
};
