
/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { AckCallback, EventAPI } from './api.base';

/*
    Events:-

    'new message'
*/

// tslint:disable-next-line:interface-name
export interface ChatAPI extends EventAPI {
    newMessage(msg: string, cb?: AckCallback<void>): boolean;
}
