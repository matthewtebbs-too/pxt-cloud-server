/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as FS from 'fs';
import * as Http from 'http';
require('http-shutdown').extend();
import * as Path from 'path';

import { WorldAPI } from './api.world';
import { ClientRedis } from './client.redis';
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
        FS.readFile(Path.join(__dirname, 'public') + '/index.html', (error: NodeJS.ErrnoException, data: Buffer) => {
            if (error) {
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

    public static get httpServer(): Http_ServerWithShutdown  {
        return this.singleton._httpServer;
    }

    public static get worldAPI(): WorldAPI {
        return this.singleton._worldEndpoint;
    }

    protected _httpServer: Http_ServerWithShutdown;
    protected _worldEndpoint: WorldEndpoint;

    protected constructor(port_: number = ServerConfig.port, host_: string = ServerConfig.host) {
        this._httpServer = (Http.createServer(Server._handler) as any as Http_ServerWithShutdown).withShutdown();

        this._httpServer.listen(port_, host_, () => debug(`listening on ${host_} at port ${port_}`));
        this._httpServer.on('close', () => debug(`closed`));
        this._httpServer.on('error', error => debug(error));

        this._worldEndpoint = new WorldEndpoint(this._httpServer);
    }

    public dispose() {
        this._httpServer.close();
    }
}

process.on('SIGINT', () => {
    ClientRedis.singleton.dispose();
    Server.singleton.dispose();
});
