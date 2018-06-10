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

class Server implements API.ServerAPI {
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

    public get chatAPI(): API.ChatAPI | null {
        return this._endpoints.chat as API.EventAPI as API.ChatAPI;
    }

    public get usersAPI(): API.UsersAPI | null {
        return this._endpoints.users as API.EventAPI as API.UsersAPI;
    }

    public get worldAPI(): API.WorldAPI | null {
        return this._endpoints.world as API.EventAPI as API.WorldAPI;
    }

    protected _httpServer: HttpServerWithShutdown | null = null;

    protected _socketServer: SocketServer | null = null;

    protected _redisClient: RedisClient | null = null;

    protected _endpoints: {[key: string]: Endpoints.Endpoint | null} = {
        chat: null,
        users: null,
        world: null,
    };

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
                    .then(client => {
                        this._endpoints = {
                            chat: new Endpoints.ChatEndpoint(this._socketServer!.socketAPI!, client.redisAPI!),
                            users: new Endpoints.UsersEndpoint(this._socketServer!.socketAPI!, client.redisAPI!),
                            world: new Endpoints.WorldEndpoint(this._socketServer!.socketAPI!, client.redisAPI!),
                        };
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
}

process.on('SIGINT', () => {
    Server.singleton.dispose();
});

export function startServer(port?: number, host?: string): Promise<API.ServerAPI> {
    return Server.singleton.start(port, host);
}
