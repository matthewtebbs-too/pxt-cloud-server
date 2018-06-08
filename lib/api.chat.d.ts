import { AckCallback, EventAPI } from './api.base';
export interface ChatAPI extends EventAPI {
    newMessage(msg: string, cb?: AckCallback<void>): boolean;
}
