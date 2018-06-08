import { AckCallback, EventAPI } from './api.base';
export declare type MessageData = {
    text: string;
};
export interface ChatAPI extends EventAPI {
    newMessage(msg: string | MessageData, cb?: AckCallback<void>): boolean;
}
