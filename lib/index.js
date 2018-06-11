'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var events = _interopDefault(require('events'));
var redis = _interopDefault(require('redis'));
var require$$0 = _interopDefault(require('debug'));
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
class RedisClient extends events.EventEmitter {
    constructor() {
        super(...arguments);
        this._redis = null;
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
    get client() {
        return this._redis;
    }
    connect(port_ = server_config_1$1.ServerConfig.redisport, host_ = server_config_1$1.ServerConfig.redishost) {
        this.dispose();
        return new Promise((resolve, reject) => {
            this._redis = new redis.RedisClient({ host: host_, port: port_, retry_strategy: RedisClient._retrystrategy });
            this._redis.on('ready', () => {
                this._redis.on('end', () => debug(`connection ended`));
                debug(`connection ready`);
                resolve(this);
            });
            this._redis.on('error', err => {
                debug(err);
                reject(err);
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

const debug = require$$0('pxt-cloud:socket.server');
class SocketServer {
    constructor(server) {
        this._socketio = null;
        this._socketio = socket(server);
        debug(`listening`);
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

var api = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require$$0('pxt-cloud:api');
function ackHandler(cb) {
    return (error, reply) => {
        if (cb) {
            cb({ error, reply });
        }
        if (error) {
            debug(error);
        }
    };
}
exports.ackHandler = ackHandler;
function mappedAckHandler(map, cb) {
    return (error, reply) => ackHandler(cb)(error, map(reply));
}
exports.mappedAckHandler = mappedAckHandler;
function extractSocketFromArgs(args) {
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
exports.extractSocketFromArgs = extractSocketFromArgs;
function promisefy(thisArg, fn, ...args_) {
    return new Promise((resolve, reject) => {
        const [args, socket$$1] = extractSocketFromArgs(args_);
        fn.call(thisArg, ...args, (ack) => {
            if (!ack.error) {
                resolve(ack.reply);
            }
            else {
                reject(ack.error);
            }
        }, socket$$1);
    });
}
exports.promisefy = promisefy;
});

var api$1 = unwrapExports(api);
var api_1 = api.ackHandler;
var api_2 = api.mappedAckHandler;
var api_3 = api.extractSocketFromArgs;
var api_4 = api.promisefy;

var api$2 = /*#__PURE__*/Object.freeze({
	default: api$1,
	__moduleExports: api,
	ackHandler: api_1,
	mappedAckHandler: api_2,
	extractSocketFromArgs: api_3,
	promisefy: api_4
});

var API = ( api$2 && api$1 ) || api$2;

var endpoint_ = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


const debug = require$$0('pxt-cloud:endpoint');
class Endpoint extends events.EventEmitter {
    constructor(publicAPI, redisClient, socketServer, nsp) {
        super();
        this._publicAPI = publicAPI;
        this._redisClient = redisClient;
        const socketNamespace = socketServer.of(`/${nsp || ''}`);
        socketNamespace.on('connect', (socket$$1) => {
            debug(`${socket$$1.id} client connected from ${socket$$1.handshake.address}`);
            this._onClientConnect(socket$$1);
        });
        socketNamespace.on('error', (error) => {
            debug(error);
        });
    }
    static connectId(socket$$1) {
        return socket$$1 ? socket$$1.id : 'localhost';
    }
    get publicAPI() {
        return this._publicAPI;
    }
    get redisClient() {
        return this._redisClient;
    }
    _broadcastEvent(event, ...args_) {
        const [args, socket$$1] = API.extractSocketFromArgs(args_);
        if (socket$$1) {
            if (!socket$$1.broadcast.emit(event, ...args)) {
                return false;
            }
        }
        if (!this.emit(event, args)) {
            return false;
        }
        return true;
    }
    _onClientConnect(socket$$1) {
        socket$$1.on('disconnect', reason => {
            debug(`${socket$$1.id} client disconnected from ${socket$$1.handshake.address} (${reason})`);
            this._onClientDisconnect(socket$$1);
        });
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


const debug = require$$0('pxt-cloud:endpoint.chat');
class ChatEndpoint extends endpoint_1.Endpoint {
    constructor(publicAPI, redisClient, socketServer) {
        super(publicAPI, redisClient, socketServer, 'pxt-cloud.chat');
    }
    newMessage(msg, cb, socket$$1) {
        this.publicAPI.users.selfInfoAsync()
            .then(user => this._broadcastEvent('new message', typeof msg === 'object' ? msg : { name: user.name, text: msg }, cb, socket$$1))
            .catch(API.ackHandler(cb));
    }
    newMessageAsync(msg, socket$$1) {
        return API.promisefy(this, this.newMessage, msg, socket$$1);
    }
    _onClientConnect(socket$$1) {
        super._onClientConnect(socket$$1);
        socket$$1.on('new message', (msg, cb) => this.newMessage(msg, cb, socket$$1));
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


const debug = require$$0('pxt-cloud:endpoint.users');
const UsersDBKeys = {
    user: (sockid) => `user:${sockid}`,
};
class UsersEndpoint extends endpoint_1.Endpoint {
    constructor(publicAPI, redisClient, socketServer) {
        super(publicAPI, redisClient, socketServer, 'pxt-cloud.users');
    }
    selfInfo(cb, socket$$1) {
        const userId = endpoint_1.Endpoint.userId(socket$$1);
        const userkey = UsersDBKeys.user(userId);
        this.redisClient.hgetall(userkey, API.mappedAckHandler(reply => {
            return {
                name: reply && reply.name ? reply.name : '',
            };
        }, cb));
    }
    selfInfoAsync(socket$$1) {
        return API.promisefy(this, this.selfInfo, socket$$1);
    }
    addSelf(user, cb, socket$$1) {
        const userId = endpoint_1.Endpoint.userId(socket$$1);
        const userkey = UsersDBKeys.user(userId);
        const multi = this.redisClient.multi()
            .exists(userkey)
            .hmset(userkey, {
            name: user.name || '',
        });
        multi.exec(API.mappedAckHandler(reply => {
            const existed = !!reply && reply[0];
            if (!existed) {
                this._broadcastEvent('user joined', userId, user, socket$$1);
            }
            return existed;
        }, cb));
    }
    addSelfAsync(user, socket$$1) {
        return API.promisefy(this, this.addSelf, user, socket$$1);
    }
    removeSelf(cb, socket$$1) {
        const userId = endpoint_1.Endpoint.userId(socket$$1);
        const userkey = UsersDBKeys.user(userId);
        this.redisClient.del(userkey, API.mappedAckHandler(reply => {
            const existed = !!reply;
            if (existed) {
                this._broadcastEvent('user left', userId, socket$$1);
            }
            return existed;
        }, cb));
    }
    removeSelfAsync(socket$$1) {
        return API.promisefy(this, this.removeSelf, socket$$1);
    }
    _onClientConnect(socket$$1) {
        super._onClientConnect(socket$$1);
        socket$$1.on('self info', (cb) => this.selfInfo(cb, socket$$1));
        socket$$1.on('add self', (user, cb) => this.addSelf(user, cb, socket$$1));
        socket$$1.on('remove self', (cb) => this.removeSelf(cb, socket$$1));
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

const debug = require$$0('pxt-cloud:endpoint.world');
class WorldEndpoint extends endpoint_1.Endpoint {
    constructor(publicAPI, redisClient, socketServer) {
        super(publicAPI, redisClient, socketServer, 'pxt-cloud.world');
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

var require$$1 = ( endpoint_chat$2 && endpoint_chat$1 ) || endpoint_chat$2;

var require$$2 = ( endpoint_users$2 && endpoint_users$1 ) || endpoint_users$2;

var require$$3 = ( endpoint_world$2 && endpoint_world$1 ) || endpoint_world$2;

var endpoints = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(endpoint_1);
__export(require$$1);
__export(require$$2);
__export(require$$3);
});

var endpoints$1 = unwrapExports(endpoints);

var endpoints$2 = /*#__PURE__*/Object.freeze({
	default: endpoints$1,
	__moduleExports: endpoints
});

var client_redis_1$1 = ( client_redis$2 && client_redis$1 ) || client_redis$2;

var socket_server_1$1 = ( socket_server$2 && socket_server$1 ) || socket_server$2;

var Endpoints = ( endpoints$2 && endpoints$1 ) || endpoints$2;

var server = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


httpShutdown.extend();





const debug = require$$0('pxt-cloud:server');
class Server {
    constructor() {
        this._httpServer = null;
        this._socketServer = null;
        this._redisClient = null;
        this._publicAPI = { public: null };
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
        return this._publicAPI;
    }
    start(port_ = server_config_1$1.ServerConfig.port, host_ = server_config_1$1.ServerConfig.host) {
        this.dispose();
        return new Promise((resolve, reject) => {
            this._httpServer = http.createServer(Server._handler).withShutdown();
            this._httpServer.listen(port_, host_, () => {
                this._httpServer.on('close', () => debug(`closed`));
                debug(`listening on ${host_} at port ${port_}`);
                this._socketServer = new socket_server_1$1.SocketServer(this._httpServer);
                this._redisClient = new client_redis_1$1.RedisClient();
                this._redisClient.connect()
                    .then(() => {
                    this._publicAPI.public = this.publicAPI;
                    this._createAPI('users', Endpoints.UsersEndpoint);
                    this._createAPI('chat', Endpoints.ChatEndpoint);
                    this._createAPI('world', Endpoints.WorldEndpoint);
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
    dispose() {
        this._disposeAPI('world');
        this._disposeAPI('chat');
        this._disposeAPI('users');
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
    _createAPI(name, ctor) {
        const redisClient = this._redisClient ? this._redisClient.client : null;
        const socketServer = this._socketServer ? this._socketServer.server : null;
        if (!redisClient || !socketServer) {
            return false;
        }
        this._publicAPI[name] = new ctor(this.publicAPI, redisClient, socketServer);
        return true;
    }
    _disposeAPI(name) {
        if (name in this._publicAPI) {
            delete this._publicAPI[name];
        }
    }
}
Server._singleton = new Server();
process.on('SIGINT', () => {
    Server.singleton.dispose();
});
function startServer(port, host) {
    return Server.singleton.start(port, host).then(server => server.publicAPI);
}
exports.startServer = startServer;
});

var server$1 = unwrapExports(server);
var server_1 = server.startServer;

exports.default = server$1;
exports.startServer = server_1;
