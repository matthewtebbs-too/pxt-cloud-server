/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as FS from 'fs';
import * as Http from 'http';
require('http-shutdown').extend();
import * as Path from 'path';

import { RedisClient } from './client.redis';
import { ServerConfig } from './server.config';
import { SocketServer } from './socket.server';

import * as API from './api';
import * as Endpoints from './endpoints';

const debug = require('debug')('pxt-cloud:server');

interface HttpServerWithShutdown extends Http.Server {
    withShutdown(): this;
    shutdown(listener?: () => void): void;
}

class Server {
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

    public static get singleton() {
        return this._singleton;
    }

    public get publicAPI() {
        return this._publicAPI;
    }

    protected _httpServer: HttpServerWithShutdown | null = null;
    protected _socketServer: SocketServer | null = null;
    protected _redisClient: RedisClient | null = null;

    protected _publicAPI: API.PublicAPI = { public: null };

    public start(port_: number = ServerConfig.port, host_: string = ServerConfig.host): Promise<this> {
        this.dispose();

        return new Promise((resolve, reject) => {
            this._httpServer = (Http.createServer(Server._handler) as any as HttpServerWithShutdown).withShutdown();

            this._httpServer.listen(port_, host_, () => {
                this._httpServer!.on('close', () => debug(`closed`));

                debug(`listening on ${host_} at port ${port_}`);

                this._socketServer = new SocketServer(this._httpServer);
                this._redisClient = new RedisClient();

                this._redisClient.connect()
                    .then(() => {
                        this._publicAPI.public = this.publicAPI;

                        this._createAPI('users', Endpoints.UsersEndpoint);
                        this._createAPI('chat', Endpoints.ChatEndpoint);
                        this._createAPI('world', Endpoints.WorldEndpoint);

                        resolve(this);
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
        this._disposeAPI('world');
        this._disposeAPI('chat');
        this._disposeAPI('users');

        if (this._socketServer) {
            this._socketServer.dispose();
            this._socketServer = null;
        }

        if (this._redisClient) {
            this._redisClient.dispose();
            this._redisClient = null;
        }

        if (this._httpServer) {
            this._httpServer.close();
            this._httpServer = null;
        }
    }

    protected _createAPI<T extends keyof API.PublicAPI>(name: T, ctor: Endpoints.IEndpointConstructor): boolean {
        const socketAPI = this._socketServer ? this._socketServer.socketAPI : null;
        const redisAPI = this._redisClient ? this._redisClient.redisAPI : null;

        if (!socketAPI || !redisAPI) {
            return false;
        }

        this._publicAPI[name] = new ctor(this.publicAPI, redisAPI, socketAPI);

        return true;
    }

    protected _disposeAPI<T extends keyof API.PublicAPI>(name: T) {
        if (name in this._publicAPI) {
            delete this._publicAPI[name];
        }
    }
}

process.on('SIGINT', () => {
    Server.singleton.dispose();
});

export function startServer(port?: number, host?: string): Promise<API.PublicAPI> {
    return Server.singleton.start(port, host).then(server => server.publicAPI);
}
