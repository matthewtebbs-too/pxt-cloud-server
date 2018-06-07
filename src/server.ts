/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as FS from 'fs';
import * as Http from 'http';
require('http-shutdown').extend();
import * as Path from 'path';

import { WorldAPI } from './api.world';
import { RedisAPI, RedisClient } from './client.redis';
import { WorldEndpoint } from './endpoint.world';
import { ServerConfig } from './server.config';
import { SocketServer } from './socket.server';

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

    public get httpServer(): Http_ServerWithShutdown | null {
        return this._httpServer;
    }

    public get socketServerAPI(): SocketIO.Server | null {
        return this._socketServer ? this._socketServer.socketAPI : null;
    }

    public get redisAPI(): RedisAPI |  null {
        return this._redisClient ? this._redisClient.redisAPI : null;
    }

    public get worldAPI(): WorldAPI | null {
        return this._worldEndpoint;
    }

    protected _httpServer: Http_ServerWithShutdown | null = null;
    protected _socketServer: SocketServer | null = null;
    protected _redisClient: RedisClient | null = null;
    protected _worldEndpoint: WorldEndpoint | null = null;

    public connect(port_: number = ServerConfig.port, host_: string = ServerConfig.host): Promise<Server> {
        this.dispose();

        return new Promise((resolve, reject) => {
            this._httpServer = (Http.createServer(Server._handler) as any as Http_ServerWithShutdown).withShutdown();

            this._httpServer.listen(port_, host_, () => {
                this._httpServer!.on('close', () => debug(`closed`));

                debug(`listening on ${host_} at port ${port_}`);

                this._socketServer = new SocketServer(this._httpServer);

                this._redisClient = new RedisClient();

                this._redisClient.connect()
                    .then(client => {
                        this._worldEndpoint = new WorldEndpoint(this._socketServer!.socketAPI!, client.redisAPI!);
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
