/*
    MIT License

    Copyright (c) 2018 MuddyTummy Software LLC
*/

import * as FS from 'fs';
import * as Http from 'http';
import * as Path from 'path';

import { ServerConfig } from './server.config';

const debug = require('debug')('pxt-cloud:server');

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

    protected _server: Http.Server;

    public get httpserver(): Http.Server {
        return this._server;
    }

    protected constructor(port: number = ServerConfig.port, hostname: string = ServerConfig.hostname) {
        this._server = Http.createServer(Server._handler);
        this._server.listen(port, hostname, () => debug(`server listening on ${hostname} at port ${port}`));
    }
}
