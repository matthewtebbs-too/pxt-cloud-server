import * as API from 'pxt-cloud-api';
export * from './server.config';
export declare function startServer(port?: number, host?: string): PromiseLike<API.PublicAPI>;
export declare function disposeServer(): void;
