
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { AckCallback, EventAPI } from './api.base';

// tslint:disable-next-line:interface-over-type-literal
export type MessageData = {
    text: string;
};

/*
    Events:-

    'new message'
*/

// tslint:disable-next-line:interface-name
export interface ChatAPI extends EventAPI {
    newMessage(msg: string | MessageData, cb?: AckCallback<void>): boolean;
}
