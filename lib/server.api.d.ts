import { WorldAPI } from './api.world';
export * from './api.base';
export * from './api.world';
export interface ServerAPI {
    worldAPI: WorldAPI | null;
}
