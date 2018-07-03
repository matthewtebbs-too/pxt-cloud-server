'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var require$$0 = _interopDefault(require('debug'));
var events = _interopDefault(require('events'));
var redis = _interopDefault(require('redis'));
var socket = _interopDefault(require('socket.io'));
var pxtCloudApi = _interopDefault(require('pxt-cloud-api'));
var bluebird = _interopDefault(require('bluebird'));
var fs = _interopDefault(require('fs'));
var https = _interopDefault(require('https'));
var httpShutdown = _interopDefault(require('http-shutdown'));
var path = _interopDefault(require('path'));

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var server_config = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require$$0('pxt-cloud:server');
class ServerConfig {
}
ServerConfig.host = process.env.PXT_CLOUD_HOST || 'localhost';
ServerConfig.port = process.env.PXT_CLOUD_PORT ? parseInt(process.env.PXT_CLOUD_PORT, 10) : 3000;
ServerConfig.redishost = process.env.PXT_CLOUD_REDISHOST || 'localhost';
ServerConfig.redisport = process.env.PXT_CLOUD_REDISPORT ? parseInt(process.env.PXT_CLOUD_REDISPORT, 10) : 6379;
exports.ServerConfig = ServerConfig;
debug(`Configuration:-
    Host [PXT_CLOUD_HOST]:              ${ServerConfig.host}
    Port [PXT_CLOUD_PORT]:              ${ServerConfig.port}
    Redis host [PXT_CLOUD_REDISHOST]:   ${ServerConfig.redishost}
    Redis port [PXT_CLOUD_REDISPORT]:   ${ServerConfig.redisport}`);
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



const debug = require$$0('pxt-cloud:server:redis');
class RedisClient extends events.EventEmitter {
    constructor() {
        super(...arguments);
        this._redis = null;
    }
    static _retrystrategy(options) {
        const maxTotalRetryTimeSec = 60 * 15;
        const maxRetryTimeSec = 60 * 2;
        const maxTotalAttempts = 20;
        const randomizationJitter = 0.5;
        let error = null;
        if (options.total_retry_time > 1000 * maxTotalRetryTimeSec) {
            error = new Error('retry time exhausted');
        }
        else if (options.attempt > maxTotalAttempts) {
            error = new Error('max retry attempts reached');
        }
        if (error) {
            debug(error.message);
            return error;
        }
        const retryDelay = Math.min(options.total_retry_time + options.attempt * 100, 1000 * maxRetryTimeSec);
        return Math.round(retryDelay * (randomizationJitter * Math.random() + (1 - randomizationJitter)));
    }
    get client() {
        return this._redis;
    }
    connect(initialized, port_ = server_config_1$1.ServerConfig.redisport, host_ = server_config_1$1.ServerConfig.redishost) {
        this.dispose();
        return new Promise((resolve, reject) => {
            this._redis = new redis.RedisClient({ host: host_, port: port_, retry_strategy: RedisClient._retrystrategy });
            initialized();
            this._redis.on('connect', () => debug(`connected`));
            this._redis.on('ready', () => {
                debug(`ready`);
                resolve(this);
            });
            this._redis.on('reconnecting', (stats) => {
                debug(`reconnecting with attempt ${stats.attempt} after ${stats.delay} msec`);
                if (stats.error) {
                    debug(`[${stats.error.message}]\n`);
                }
            });
            this._redis.on('end', () => debug(`ended`));
            this._redis.on('error', error => {
                debug(error.message);
                reject(error);
            });
        });
    }
    dispose() {
        if (this._redis) {
            this._redis.quit();
            this._redis = null;
        }
    }
}
exports.RedisClient = RedisClient;
});

var client_redis$1 = unwrapExports(client_redis);
var client_redis_1 = client_redis.RedisClient;

var client_redis$2 = /*#__PURE__*/Object.freeze({
	default: client_redis$1,
	__moduleExports: client_redis,
	RedisClient: client_redis_1
});

var socket_server = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

const debug = require$$0('pxt-cloud:server:sockets');
class SocketServer {
    constructor(server) {
        this._socketio = null;
        this._socketio = socket(server);
        if (this._socketio) {
            debug(`listening`);
        }
    }
    get server() {
        return this._socketio;
    }
    dispose() {
        if (this._socketio) {
            this._socketio.close((() => debug(`closed`)));
            this._socketio = null;
        }
    }
}
exports.SocketServer = SocketServer;
});

var socket_server$1 = unwrapExports(socket_server);
var socket_server_1 = socket_server.SocketServer;

var socket_server$2 = /*#__PURE__*/Object.freeze({
	default: socket_server$1,
	__moduleExports: socket_server,
	SocketServer: socket_server_1
});

var endpoint_ = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class Endpoint extends events.EventEmitter {
    constructor(endpoints, redisClient, socketServer, nsp) {
        super();
        this.off = super.removeListener;
        this._socketNamespace = null;
        const socketNamespace = socketServer.of(`pxt-cloud${nsp ? `/${nsp}` : ''}`);
        this._socketNamespace = socketNamespace;
        this._endpoints = endpoints;
        this._redisClient = redisClient;
        socketNamespace.on('connect', (socket$$1) => {
            this._debug(`${socket$$1.id} client connected from ${socket$$1.handshake.address}`);
            this._onClientConnect(socket$$1);
            socket$$1.on('disconnect', reason => {
                this._debug(`${socket$$1.id} client disconnected from ${socket$$1.handshake.address} (${reason})`);
                this._onClientDisconnect(socket$$1);
            });
        });
        socketNamespace.on('error', (error) => {
            this._debug(`${error.message}\n`);
        });
    }
    static connectId(socket$$1) {
        return socket$$1 ? socket$$1.client.id : 'localhost';
    }
    static _extractSocketFromArgs(args) {
        let socket$$1;
        if (args.length > 0) {
            const _socket = args[args.length - 1];
            if (undefined === _socket || (typeof _socket === 'object' && 'broadcast' in _socket)) {
                socket$$1 = _socket;
                args = args.slice(0, -1);
            }
        }
        return [args, socket$$1];
    }
    static _fulfillReceivedEvent(promise, cb) {
        promise.then(value => cb(null, value), cb);
    }
    get isConnected() {
        return !!this._socketNamespace;
    }
    get endpoints() {
        return this._endpoints;
    }
    get redisClient() {
        return this._redisClient;
    }
    dispose() {
        this._socketNamespace = null;
    }
    _notifyEvent(event, ...args) {
        return this.emit(event, args);
    }
    _broadcastNotifyEvent(event, ...args_) {
        const [args, socket$$1] = Endpoint._extractSocketFromArgs(args_);
        if (socket$$1) {
            if (!socket$$1.broadcast.emit(event, ...args)) {
                return false;
            }
        }
        return this._notifyEvent(event, args);
    }
    _onClientConnect(socket$$1) {
    }
    _onClientDisconnect(socket$$1) {
    }
}
Endpoint.userId = Endpoint.connectId;
exports.Endpoint = Endpoint;
});

var endpoint_$1 = unwrapExports(endpoint_);
var endpoint__1 = endpoint_.Endpoint;

var endpoint_$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_$1,
	__moduleExports: endpoint_,
	Endpoint: endpoint__1
});

var endpoint_1 = ( endpoint_$2 && endpoint_$1 ) || endpoint_$2;

var endpoint_chat = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


const debug = require$$0('pxt-cloud:endpoint:chat');
class ChatEndpoint extends endpoint_1.Endpoint {
    constructor(endpoints, redisClient, socketServer) {
        super(endpoints, redisClient, socketServer, 'chat');
        this._debug = debug;
    }
    newMessage(msg, socket$$1) {
        return this.endpoints.users
            .selfInfo(socket$$1)
            .then(user => {
            if (typeof msg !== 'object') {
                msg = { text: msg };
            }
            this._broadcastNotifyEvent(pxtCloudApi.Events.ChatNewMessage, Object.assign({}, msg, { name: user.name }), socket$$1);
        });
    }
    _onClientConnect(socket$$1) {
        super._onClientConnect(socket$$1);
        socket$$1.on(pxtCloudApi.Events.ChatNewMessage, (msg, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this.newMessage(msg, socket$$1), cb));
    }
}
exports.ChatEndpoint = ChatEndpoint;
});

var endpoint_chat$1 = unwrapExports(endpoint_chat);
var endpoint_chat_1 = endpoint_chat.ChatEndpoint;

var endpoint_chat$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_chat$1,
	__moduleExports: endpoint_chat,
	ChatEndpoint: endpoint_chat_1
});

var endpoint_users = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


const debug = require$$0('pxt-cloud:endpoint:users');
const UsersDBKeys = {
    user: (id) => `user:${id}`,
};
class UsersEndpoint extends endpoint_1.Endpoint {
    constructor(endpoints, redisClient, socketServer) {
        super(endpoints, redisClient, socketServer, 'users');
        this._debug = debug;
    }
    selfInfo(socket$$1) {
        return new Promise((resolve, reject) => {
            const userId = endpoint_1.Endpoint.userId(socket$$1);
            const userkey = UsersDBKeys.user(userId);
            this.redisClient.hgetall(userkey, (error, reply) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve({
                    name: reply && reply.name ? reply.name : '',
                    id: userId,
                });
            });
        });
    }
    addSelf(user, socket$$1) {
        return new Promise((resolve, reject) => {
            const userId = endpoint_1.Endpoint.userId(socket$$1);
            const userkey = UsersDBKeys.user(userId);
            const multi = this.redisClient.multi()
                .exists(userkey)
                .hmset(userkey, {
                name: user.name || '',
            });
            multi.exec((error, reply) => {
                if (error) {
                    reject(error);
                    return;
                }
                const existed = !!reply && reply[0];
                if (!existed) {
                    this._broadcastNotifyEvent(pxtCloudApi.Events.UserJoined, userId, user, socket$$1);
                }
                resolve(existed);
            });
        });
    }
    removeSelf(socket$$1) {
        return new Promise((resolve, reject) => {
            const userId = endpoint_1.Endpoint.userId(socket$$1);
            const userkey = UsersDBKeys.user(userId);
            this.redisClient.del(userkey, (error, reply) => {
                if (error) {
                    reject(error);
                    return;
                }
                const existed = !!reply;
                if (existed) {
                    this._broadcastNotifyEvent(pxtCloudApi.Events.UserLeft, userId, socket$$1);
                }
                resolve(existed);
            });
        });
    }
    _onClientConnect(socket$$1) {
        super._onClientConnect(socket$$1);
        socket$$1
            .on(pxtCloudApi.Events.UserSelfInfo, cb => endpoint_1.Endpoint._fulfillReceivedEvent(this.selfInfo(socket$$1), cb))
            .on(pxtCloudApi.Events.UserAddSelf, (user, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this.addSelf(user, socket$$1), cb))
            .on(pxtCloudApi.Events.UserRemoveSelf, cb => endpoint_1.Endpoint._fulfillReceivedEvent(this.removeSelf(socket$$1), cb));
    }
}
exports.UsersEndpoint = UsersEndpoint;
});

var endpoint_users$1 = unwrapExports(endpoint_users);
var endpoint_users_1 = endpoint_users.UsersEndpoint;

var endpoint_users$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_users$1,
	__moduleExports: endpoint_users,
	UsersEndpoint: endpoint_users_1
});

var endpoint_world = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



const debug = require$$0('pxt-cloud:endpoint:world');
const WorldDBKeys = {
    data: (name) => `data:${name}`,
};
class WorldEndpoint extends endpoint_1.Endpoint {
    constructor(endpoints, redisClient, socketServer) {
        super(endpoints, redisClient, socketServer, 'world');
        this._debug = debug;
        this._datarepo = new pxtCloudApi.DataRepo();
    }
    addDataSource(name, source) {
        return this._datarepo.addDataSource(name, source);
    }
    removeDataSource(name) {
        return this._datarepo.removeDataSource(name);
    }
    syncData(name) {
        return this.syncDiff(name, this._datarepo.syncData(name), false);
    }
    syncDiff(name, diff, apply = true) {
        return bluebird.mapSeries(Array.isArray(diff) ? diff : [diff], diff_ => new bluebird((resolve, reject) => {
            const datakey = WorldDBKeys.data(name);
            this.redisClient.xadd(datakey, '*', 'change', JSON.stringify(diff_), (error, reply) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(reply);
            });
            if (apply) {
                this._datarepo.applyDataDiffs(name, diff_);
            }
        }));
    }
    _onClientConnect(socket$$1) {
        super._onClientConnect(socket$$1);
        socket$$1
            .on(pxtCloudApi.Events.WorldSyncDiff, ({ name, diff }, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this.syncDiff(name, diff), cb));
    }
}
exports.WorldEndpoint = WorldEndpoint;
});

var endpoint_world$1 = unwrapExports(endpoint_world);
var endpoint_world_1 = endpoint_world.WorldEndpoint;

var endpoint_world$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_world$1,
	__moduleExports: endpoint_world,
	WorldEndpoint: endpoint_world_1
});

var client_redis_1$1 = ( client_redis$2 && client_redis$1 ) || client_redis$2;

var socket_server_1$1 = ( socket_server$2 && socket_server$1 ) || socket_server$2;

var endpoint_chat_1$1 = ( endpoint_chat$2 && endpoint_chat$1 ) || endpoint_chat$2;

var endpoint_users_1$1 = ( endpoint_users$2 && endpoint_users$1 ) || endpoint_users$2;

var endpoint_world_1$1 = ( endpoint_world$2 && endpoint_world$1 ) || endpoint_world$2;

var server = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


httpShutdown.extend();







const debug = require$$0('pxt-cloud:server');
class Server {
    constructor() {
        this._httpServer = null;
        this._socketServer = null;
        this._redisClient = null;
        this._endpoints = {
            chat: null,
            users: null,
            world: null,
        };
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
    get publicAPI() {
        return this._endpoints;
    }
    start(port_ = server_config_1$1.ServerConfig.port, host_ = server_config_1$1.ServerConfig.host) {
        this.dispose();
        return new Promise((resolve, reject) => {
            const options = {
                cert: fs.readFileSync('./test/keys/localhost.crt'),
                key: fs.readFileSync('./test/keys/localhost.key'),
                rejectUnauthorized: false,
                requestCert: false,
            };
            const httpServer = https.createServer(options, Server._handler).withShutdown();
            this._httpServer = httpServer;
            httpServer.listen(port_, host_, () => {
                debug(`listening on ${host_} at port ${port_}`);
                this._socketServer = new socket_server_1$1.SocketServer(this._httpServer);
                this._redisClient = new client_redis_1$1.RedisClient();
                const onInitializedRedis = () => {
                    this._createEndpoint('chat', endpoint_chat_1$1.ChatEndpoint);
                    this._createEndpoint('users', endpoint_users_1$1.UsersEndpoint);
                    this._createEndpoint('world', endpoint_world_1$1.WorldEndpoint);
                };
                this._redisClient
                    .connect(onInitializedRedis)
                    .then(() => resolve(this), reject);
            });
            httpServer.on('close', () => debug('closed'));
            httpServer.on('error', error => {
                debug(`${error.message}\n`);
                reject(error);
            });
        });
    }
    dispose() {
        Object.keys(this._endpoints).forEach(name => this._disposeEndpoint(name));
        if (this._socketServer) {
            this._socketServer.dispose();
            this._socketServer = null;
        }
        if (this._redisClient) {
            this._redisClient.dispose();
            this._redisClient = null;
        }
        if (this._httpServer) {
            this._httpServer.shutdown();
            this._httpServer = null;
        }
    }
    _createEndpoint(name, ctor) {
        const redisClient = this._redisClient ? this._redisClient.client : null;
        const socketServer = this._socketServer ? this._socketServer.server : null;
        if (!redisClient || !socketServer) {
            return false;
        }
        this._endpoints[name] = new ctor(this._endpoints, redisClient, socketServer);
        debug(`created '${name}' API endpoint`);
        return true;
    }
    _disposeEndpoint(name) {
        if (name in this._endpoints) {
            const endpoint = this._endpoints[name];
            if (endpoint) {
                endpoint.dispose();
                this._endpoints[name] = null;
            }
        }
    }
}
Server._singleton = new Server();
function startServer(port, host) {
    return Server.singleton.start(port, host).then(server => (Object.assign({}, server.publicAPI)));
}
exports.startServer = startServer;
function disposeServer() {
    Server.singleton.dispose();
}
exports.disposeServer = disposeServer;
process.on('SIGINT', disposeServer);
});

var server$1 = unwrapExports(server);
var server_1 = server.startServer;
var server_2 = server.disposeServer;

exports.default = server$1;
exports.startServer = server_1;
exports.disposeServer = server_2;
