import * as API from 'pxt-cloud-api';
export declare function startServer(port?: number, host?: string): PromiseLike<API.PublicAPI>;
export declare function disposeServer(): void;
