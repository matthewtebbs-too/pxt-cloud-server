/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import { WorldAPI } from './api.world';

export * from './api.base';
export * from './api.world';

// tslint:disable-next-line:interface-name
export interface ServerAPI {
    worldAPI: WorldAPI | null;
}

export declare function startServer(port?: number, host?: string): Promise<ServerAPI>;
