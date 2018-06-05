/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as FS from 'fs';
import * as Http from 'http';
require('http-shutdown').extend();
import * as Path from 'path';

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

    protected _httpserver: Http_ServerWithShutdown;

    public get httpserver(): Http_ServerWithShutdown  {
        return this._httpserver;
    }

    protected constructor(port_: number = ServerConfig.port, host_: string = ServerConfig.host) {
        this._httpserver = (Http.createServer(Server._handler) as any as Http_ServerWithShutdown).withShutdown();

        this._httpserver.listen(port_, host_, () => debug(`listening on ${host_} at port ${port_}`));
        this._httpserver.on('close', () => debug(`closed`));
        this._httpserver.on('error', error => debug(error));

    }

    public dispose() {
        this._httpserver.close();
    }
}
