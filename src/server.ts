/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as FS from 'fs';
import * as Http from 'http';
require('http-shutdown').extend();
import * as Path from 'path';

import { WorldAPI } from './api.world';
import { ClientRedis, RedisAPI } from './client.redis';
import { WorldEndpoint } from './endpoint.world';
import { ServerConfig } from './server.config';

const debug = require('debug')('pxt-cloud:server');

// tslint:disable-next-line:interface-name class-name
export interface Http_ServerWithShutdown extends Http.Server {
    withShutdown(): Http_ServerWithShutdown;
    shutdown(listener?: () => void): void;
}

export class Server {
    private static _singleton = new Server();

    private static _handler(request: Http.IncomingMessage, response: Http.ServerResponse) {
        FS.readFile(Path.join(__dirname, 'public') + '/index.html', (err: NodeJS.ErrnoException, data: Buffer) => {
            if (err) {
                response.writeHead(500);
            } else {
                response.writeHead(200);
                response.end(data);
            }
        });
    }

    public static get singleton(): Server {
        return this._singleton;
    }

    public static get httpServer(): Http_ServerWithShutdown | null {
        return this.singleton._httpServer;
    }

    public static get redisAPI(): RedisAPI |  null {
        return this.singleton._redisClient ? this.singleton._redisClient.redisAPI : null;
    }

    public static get worldAPI(): WorldAPI | null {
        return this.singleton._worldEndpoint;
    }

    protected _httpServer: Http_ServerWithShutdown | null = null;
    protected _redisClient: ClientRedis | null = null;
    protected _worldEndpoint: WorldEndpoint | null = null;

    public connect(port_: number = ServerConfig.port, host_: string = ServerConfig.host): Promise<void> {
        this.dispose();

        return new Promise((resolve, reject) => {
            this._httpServer = (Http.createServer(Server._handler) as any as Http_ServerWithShutdown).withShutdown();

            this._httpServer.listen(port_, host_, () => {
                this._httpServer!.on('close', () => debug(`closed`));

                debug(`listening on ${host_} at port ${port_}`);

                this._redisClient = new ClientRedis();

                this._redisClient.connect()
                    .then(() => {
                        this._worldEndpoint = new WorldEndpoint(this._httpServer, this._redisClient!.redisAPI!);
                        resolve();
                    })
                    .catch(err => reject(err));
            });

            this._httpServer.on('error', err => {
                debug(err);
                reject(err);
            });
         });
    }

    public dispose() {
        if (this._redisClient) {
            this._redisClient.dispose();
            this._redisClient = null;
        }

        if (this._httpServer) {
            this._httpServer.close();
            this._httpServer = null;
        }
    }
}

process.on('SIGINT', () => {
    Server.singleton.dispose();
});
