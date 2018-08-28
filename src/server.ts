/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as FS from 'fs';
import * as Http from 'http';
import * as Https from 'https';
require('http-shutdown').extend();
import * as Path from 'path';
import * as Redis from 'redis';
import * as SocketIO from 'socket.io';

import { RedisClient } from './client.redis';
import { ServerConfig } from './server.config';
import { SocketServer } from './socket.server';

import * as API from 'pxt-cloud-api';

import { ChatEndpoint } from './endpoint.chat';
import { UsersEndpoint } from './endpoint.users';
import { WorldEndpoint } from './endpoint.world';
import { Endpoint, Endpoints } from './endpoint_';

export * from './server.config';

const debug = require('debug')('pxt-cloud:server');

interface EndpointConstructor {
    new (
        endpoints: Endpoints,
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
        return this._endpoints as API.PublicAPI;
    }

    protected _httpServer: HttpServerWithShutdown | null = null;
    protected _socketServer: SocketServer | null = null;
    protected _redisClient: RedisClient | null = null;

    protected _endpoints: Endpoints = {
        chat: null,
        users: null,
        world: null,
    };

    public start(port_: number = ServerConfig.port, host_: string = ServerConfig.host): PromiseLike<this> {
        this.dispose();

        return new Promise((resolve, reject) => {
            const options = {
                cert: FS.readFileSync('./keys/localhost.crt'), /* TODO$: use CA issued certificate */
                key: FS.readFileSync('./keys/localhost.key'),
                rejectUnauthorized: false,
                requestCert: false,
            };

            const httpServer = (Https.createServer(options, Server._handler) as any as HttpServerWithShutdown).withShutdown();
            this._httpServer = httpServer;

            httpServer.listen(port_, host_, () => {
                debug(`listening on ${host_} at port ${port_}`);

                this._socketServer = new SocketServer(this._httpServer);
                this._redisClient = new RedisClient();

                const onInitializedRedis = () => {
                    this._createEndpoint('chat', ChatEndpoint);
                    this._createEndpoint('users', UsersEndpoint);
                    this._createEndpoint('world', WorldEndpoint);
                };

                this._redisClient
                    .connect(onInitializedRedis)        /* intialized */
                    .then(() => resolve(this), reject); /* connect success */
            });

            httpServer.on('close', () => {
                debug('closed');

                this._httpServer = null;
            });

            httpServer.on('error', error => {
                debug(`${error.message}\n`);

                reject(error);
            });
         });
    }

    public async dispose() {
        const namesEndpoints = Object.keys(this._endpoints) as Array<keyof API.PublicAPI>;
        namesEndpoints.forEach(async name => await this._disposeEndpoint(name));

        const socketServer = this._socketServer;

        if (socketServer) {
            this._socketServer = null;

            await socketServer.dispose();
        }

        const httpServer = this._httpServer;

        if (httpServer) {
            this._httpServer = null;

            await new Promise(resolve => httpServer.shutdown(resolve));
        }

        const redisClient = this._redisClient;

        if (redisClient) {
            this._redisClient = null;

            await redisClient.dispose();
        }
    }

    protected _createEndpoint<T extends keyof API.PublicAPI>(name: T, ctor: EndpointConstructor): boolean {
        const redisClient = this._redisClient ? this._redisClient.client : null;
        const socketServer = this._socketServer ? this._socketServer.server : null;

        if (!redisClient || !socketServer) {
            return false;
        }

        (this._endpoints[name] as Endpoint) = new ctor(this._endpoints, redisClient, socketServer);

        debug(`created '${name}' endpoint`);

        return true;
    }

    protected async _disposeEndpoint<T extends keyof API.PublicAPI>(name: T) {
        if (name in this._endpoints) {
            const endpoint = this._endpoints[name];

            if (endpoint) {
                this._endpoints[name] = null;

                await endpoint.dispose();

                debug(`disposed '${name}' endpoint`);
            }
        }
    }
}

export async function startServer(port?: number, host?: string) {
    return Server.singleton.start(port, host).then(server => ({ ...server.publicAPI }));
}

export async function disposeServer() {
    await Server.singleton.dispose();
}

process.on('SIGINT', async () => await disposeServer());
