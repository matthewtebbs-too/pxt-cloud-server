'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var require$$0 = _interopDefault(require('debug'));
var events = _interopDefault(require('events'));
var redis = _interopDefault(require('redis'));
var socket = _interopDefault(require('socket.io'));
var fs = _interopDefault(require('fs'));
var http = _interopDefault(require('http'));
var httpShutdown = _interopDefault(require('http-shutdown'));
var path = _interopDefault(require('path'));

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var api_base = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require$$0('pxt-cloud:api.base');
function ackHandler(fn, cb) {
    return (err, reply) => {
        if (cb) {
            cb({ error: err, reply: fn ? fn(reply) : reply });
        }
        if (err) {
            debug(err);
        }
    };
}
exports.ackHandler = ackHandler;
});

var api_base$1 = unwrapExports(api_base);
var api_base_1 = api_base.ackHandler;

var api_base$2 = /*#__PURE__*/Object.freeze({
	default: api_base$1,
	__moduleExports: api_base,
	ackHandler: api_base_1
});

var server_config = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
class ServerConfig {
    static get serverUri() {
        return `http://${ServerConfig.host}:${ServerConfig.port}`;
    }
}
ServerConfig.host = process.env.PXT_CLOUD_HOST || 'localhost';
ServerConfig.port = process.env.PXT_CLOUD_PORT ? parseInt(process.env.PXT_CLOUD_PORT, 10) : 3000;
ServerConfig.redishost = process.env.PXT_CLOUD_REDISHOST || 'localhost';
ServerConfig.redisport = process.env.PXT_CLOUD_REDISPORT ? parseInt(process.env.PXT_CLOUD_REDISPORT, 10) : 6379;
exports.ServerConfig = ServerConfig;
});

var server_config$1 = unwrapExports(server_config);
var server_config_1 = server_config.ServerConfig;

var server_config$2 = /*#__PURE__*/Object.freeze({
	default: server_config$1,
	__moduleExports: server_config,
	ServerConfig: server_config_1
});

var server_config_1$1 = ( server_config$2 && server_config$1 ) || server_config$2;

var client_redis = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



const debug = require$$0('pxt-cloud:redis');
class ClientRedis extends events.EventEmitter {
    constructor(port_ = server_config_1$1.ServerConfig.redisport, host_ = server_config_1$1.ServerConfig.redishost) {
        super();
        this._redisClient = new redis.RedisClient({ host: host_, port: port_, retry_strategy: ClientRedis._retrystrategy });
        this._redisClient.on('ready', () => debug(`connection ready`));
        this._redisClient.on('end', () => debug(`connection ended`));
        this._redisClient.on('error', error => debug(error));
    }
    static _retrystrategy(options) {
        let error = null;
        if (options.error && options.error.code === 'ECONNREFUSED') {
            error = options.error;
        }
        else if (options.total_retry_time > 1000 * 60 * 60) {
            error = Error('retry time exhausted');
        }
        else if (options.attempt > 10) {
            error = new Error('max retry attempts reached');
        }
        if (error) {
            debug(error);
            return error;
        }
        return Math.min(options.attempt * 100, 3000);
    }
    static get singleton() {
        return this._singleton;
    }
    static get redisAPI() {
        return this.singleton._redisClient;
    }
    dispose() {
        this._redisClient.quit();
    }
}
ClientRedis._singleton = new ClientRedis();
exports.ClientRedis = ClientRedis;
});

var client_redis$1 = unwrapExports(client_redis);
var client_redis_1 = client_redis.ClientRedis;

var client_redis$2 = /*#__PURE__*/Object.freeze({
	default: client_redis$1,
	__moduleExports: client_redis,
	ClientRedis: client_redis_1
});

var endpoint_base = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


const debug = require$$0('pxt-cloud:endpoint');
class Endpoint extends events.EventEmitter {
    constructor(server, nsp) {
        super();
        this._io = null;
        if ('httpServer' in server) {
            server = server.httpServer;
        }
        this._attach(socket(server).of(`/${nsp || ''}`));
    }
    static connectId(socket$$1) {
        return socket$$1 ? socket$$1.id : '';
    }
    get io() {
        return this._io;
    }
    _attach(io) {
        this._io = io;
        io.on('connection', (socket$$1) => {
            debug(`${io.name} client connected from ${socket$$1.handshake.address}`);
            this._onConnection(socket$$1);
            socket$$1.on('disconnect', (reason) => {
                debug(`${io.name} client disconnected from ${socket$$1.handshake.address}`);
                this._onDisconnection(socket$$1);
            });
        });
    }
    _onConnection(socket$$1) {
    }
    _onDisconnection(socket$$1) {
    }
}
exports.Endpoint = Endpoint;
});

var endpoint_base$1 = unwrapExports(endpoint_base);
var endpoint_base_1 = endpoint_base.Endpoint;

var endpoint_base$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_base$1,
	__moduleExports: endpoint_base,
	Endpoint: endpoint_base_1
});

var api_base_1$1 = ( api_base$2 && api_base$1 ) || api_base$2;

var client_redis_1$1 = ( client_redis$2 && client_redis$1 ) || client_redis$2;

var endpoint_base_1$1 = ( endpoint_base$2 && endpoint_base$1 ) || endpoint_base$2;

var endpoint_world = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



const debug = require$$0('pxt-cloud:endpoint.world');
exports.keys = {
    user: (sockid) => `user:${sockid}`,
};
class WorldEndpoint extends endpoint_base_1$1.Endpoint {
    constructor(server) {
        super(server, 'pxt-cloud.world');
    }
    addUser(user, cb, socket$$1) {
        const userkey = exports.keys.user(endpoint_base_1$1.Endpoint.connectId(socket$$1));
        const multi = client_redis_1$1.ClientRedis.redisAPI.multi()
            .exists(userkey)
            .hmset(userkey, user);
        return multi.exec(api_base_1$1.ackHandler(reply => reply[0], cb));
    }
    removeUser(cb, socket$$1) {
        const userkey = exports.keys.user(endpoint_base_1$1.Endpoint.connectId(socket$$1));
        const multi = client_redis_1$1.ClientRedis.redisAPI.multi()
            .del(userkey);
        return multi.exec(api_base_1$1.ackHandler(reply => reply[0], cb));
    }
    _onConnection(socket$$1) {
        super._onConnection(socket$$1);
        socket$$1.on('user_add', (...args) => this.addUser(args[0], args[1], socket$$1));
        socket$$1.on('user_remove', (...args) => this.removeUser(args[0], socket$$1));
    }
}
exports.WorldEndpoint = WorldEndpoint;
});

var endpoint_world$1 = unwrapExports(endpoint_world);
var endpoint_world_1 = endpoint_world.keys;
var endpoint_world_2 = endpoint_world.WorldEndpoint;

var endpoint_world$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_world$1,
	__moduleExports: endpoint_world,
	keys: endpoint_world_1,
	WorldEndpoint: endpoint_world_2
});

var endpoint_world_1$1 = ( endpoint_world$2 && endpoint_world$1 ) || endpoint_world$2;

var server = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


httpShutdown.extend();




const debug = require$$0('pxt-cloud:server');
class Server {
    constructor(port_ = server_config_1$1.ServerConfig.port, host_ = server_config_1$1.ServerConfig.host) {
        this._httpServer = http.createServer(Server._handler).withShutdown();
        this._httpServer.listen(port_, host_, () => debug(`listening on ${host_} at port ${port_}`));
        this._httpServer.on('close', () => debug(`closed`));
        this._httpServer.on('error', err => debug(err));
        this._worldEndpoint = new endpoint_world_1$1.WorldEndpoint(this._httpServer);
    }
    static _handler(request, response) {
        fs.readFile(path.join(__dirname, 'public') + '/index.html', (err, data) => {
            if (err) {
                response.writeHead(500);
            }
            else {
                response.writeHead(200);
                response.end(data);
            }
        });
    }
    static get singleton() {
        return this._singleton;
    }
    static get httpServer() {
        return this.singleton._httpServer;
    }
    static get worldAPI() {
        return this.singleton._worldEndpoint;
    }
    dispose() {
        this._httpServer.close();
    }
}
Server._singleton = new Server();
exports.Server = Server;
process.on('SIGINT', () => {
    client_redis_1$1.ClientRedis.singleton.dispose();
    Server.singleton.dispose();
});
});

var server$1 = unwrapExports(server);
var server_1 = server.Server;

var server$2 = /*#__PURE__*/Object.freeze({
	default: server$1,
	__moduleExports: server,
	Server: server_1
});

var require$$1 = ( server$2 && server$1 ) || server$2;

var built = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(api_base_1$1);
__export(require$$1);
});

var index = unwrapExports(built);

module.exports = index;
