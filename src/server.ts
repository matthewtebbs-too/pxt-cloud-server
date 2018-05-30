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

    private _server: Http.Server = Http.createServer(Server._handler);

    public get httpserver(): Http.Server {
        return this._server;
    }

    constructor(port: number = ServerConfig.port, hostname: string = ServerConfig.hostname) {
        this._server.listen(port, hostname, () => debug(`server listening on ${hostname} at port ${port}`));
    }

    protected _onDispose() {
        this._server.close();
    }
}
