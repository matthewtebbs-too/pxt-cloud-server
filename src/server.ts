/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as FS from 'fs';
import * as Http from 'http';
require('http-shutdown').extend();
import * as Path from 'path';
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import { RedisClient } from './client.redis';
import { ServerConfig } from './server.config';
import { SocketServer } from './socket.server';

import * as API from './api';
import * as API_ from './api_';

import { ChatEndpoint } from './endpoint.chat';
import { UsersEndpoint } from './endpoint.users';
import { WorldEndpoint } from './endpoint.world';
import { Endpoint } from './endpoint_';

const debug = require('debug')('pxt-cloud:server');

interface EndpointConstructor {
    new (
        privateAPI: API_.PrivateAPI,
        redisClient: Redis.RedisClient,
        socketServer: SocketIO.Server,
        nsp?: string,
    ): Endpoint;
}

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
        return this._privateAPI as API.PublicAPI;
    }

    protected _httpServer: HttpServerWithShutdown | null = null;
    protected _socketServer: SocketServer | null = null;
    protected _redisClient: RedisClient | null = null;

    protected _privateAPI: API_.PrivateAPI = {};

    public start(port_: number = ServerConfig.port, host_: string = ServerConfig.host): Promise<this> {
        this.dispose();

        return new Promise((resolve, reject) => {
            this._httpServer = (Http.createServer(Server._handler) as any as HttpServerWithShutdown).withShutdown();

            this._httpServer.listen(port_, host_, () => {
                this._httpServer!.on('close', () => debug(`closed`));

                debug(`listening on ${host_} at port ${port_}`);

                this._socketServer = new SocketServer(this._httpServer);
                this._redisClient = new RedisClient();

                const onInitializedRedis = () => {
                    this._createAPI('users', UsersEndpoint);
                    this._createAPI('chat', ChatEndpoint);
                    this._createAPI('world', WorldEndpoint);
                };

                this._redisClient
                    .connect(onInitializedRedis)    /* intialized */
                    .then(() => resolve(this))      /* connect success */
                    .catch(reject);                 /* connect faiure */
            });

            this._httpServer.on('error', error => {
                debug(`${error.message}\n`);
                reject(error);
            });
         });
    }

    public dispose() {
        (Object.keys(this._privateAPI) as Array<keyof API.PublicAPI>).forEach(name => this._disposeAPI(name));

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

    protected _createAPI<T extends keyof API.PublicAPI>(name: T, ctor: EndpointConstructor): boolean {
        const redisClient = this._redisClient ? this._redisClient.client : null;
        const socketServer = this._socketServer ? this._socketServer.server : null;

        if (!redisClient || !socketServer) {
            return false;
        }

        this._privateAPI[name] = new ctor(this._privateAPI, redisClient, socketServer);
        debug(`created '${name}' API endpoint`);

        return true;
    }

    protected _disposeAPI<T extends keyof API.PublicAPI>(name: T) {
        if (name in this._privateAPI) {
            const endpoint = this._privateAPI[name];

            if (endpoint) {
                endpoint.dispose();
                this._privateAPI[name] = null;
            }
        }
    }
}

process.on('SIGINT', () => {
    Server.singleton.dispose();
});

export function startServer(port?: number, host?: string): Promise<API.PublicAPI> {
    return Server.singleton.start(port, host).then(server => server.publicAPI);
}
