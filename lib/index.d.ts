import { WorldAPI } from './api.world';
export * from './api.base';
export * from './api.world';
export interface ServerAPI {
    worldAPI: WorldAPI | null;
}
export declare function startServer(port?: number, host?: string): Promise<ServerAPI>;
