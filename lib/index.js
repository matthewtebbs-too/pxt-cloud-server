'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var require$$0 = _interopDefault(require('debug'));
var events = _interopDefault(require('events'));
var redis = _interopDefault(require('redis'));
var socket = _interopDefault(require('socket.io'));
var pxtCloudApi = _interopDefault(require('pxt-cloud-api'));
var fs = _interopDefault(require('fs'));
var https = _interopDefault(require('https'));
var httpShutdown = _interopDefault(require('http-shutdown'));
var path = _interopDefault(require('path'));

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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
            this._redis = new redis.RedisClient({
                host: host_,
                port: port_,
                retry_strategy: RedisClient._retrystrategy,
            });
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
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });

exports.EndpointDBKeys = {
    blob: 'blob',
};
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
                args.pop();
            }
        }
        return [args, socket$$1];
    }
    static _fulfillReceivedEvent(promise, cb) {
        promise.then(value => cb(null, value), cb);
    }
    static _promiseHandler(resolve, reject) {
        return (error, reply) => !error ? resolve(reply) : reject(error);
    }
    static _binaryPromiseHandler(resolve, reject) {
        return Endpoint._promiseHandler(reply => {
            reply ? resolve(Buffer.from(reply, 'binary')) : resolve();
        }, reject);
    }
    static _binaryarrayPromiseHandler(resolve, reject) {
        return Endpoint._promiseHandler(reply => {
            reply ? resolve(reply.map(r => Buffer.from(r, 'binary'))) : resolve();
        }, reject);
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
    _initializeClient(socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    _isInitialized(socket$$1) {
        return !socket$$1 || !socket$$1.connected || socket$$1.initialized;
    }
    _ensureInitializedClient(socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._isInitialized(socket$$1)) {
                socket$$1.initialized = yield this._initializeClient(socket$$1);
            }
        });
    }
    _notifyEvent(event, ...args_) {
        return __awaiter(this, void 0, void 0, function* () {
            const [args, socket$$1] = Endpoint._extractSocketFromArgs(args_);
            this.emit(event, ...args);
            if (socket$$1) {
                yield this._ensureInitializedClient(socket$$1);
                socket$$1.broadcast.emit(event, ...args);
            }
        });
    }
    _onClientConnect(socket$$1) {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () { return yield this._ensureInitializedClient(socket$$1); }));
    }
    _onClientDisconnect(socket$$1) {
    }
}
Endpoint.userId = Endpoint.connectId;
exports.Endpoint = Endpoint;
});

var endpoint_$1 = unwrapExports(endpoint_);
var endpoint__1 = endpoint_.EndpointDBKeys;
var endpoint__2 = endpoint_.Endpoint;

var endpoint_$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_$1,
	__moduleExports: endpoint_,
	EndpointDBKeys: endpoint__1,
	Endpoint: endpoint__2
});

var endpoint_1 = ( endpoint_$2 && endpoint_$1 ) || endpoint_$2;

var endpoint_chat = createCommonjsModule(function (module, exports) {
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });


const debug = require$$0('pxt-cloud:endpoint:chat');
class ChatEndpoint extends endpoint_1.Endpoint {
    constructor(endpoints, redisClient, socketServer) {
        super(endpoints, redisClient, socketServer, 'chat');
        this._debug = debug;
    }
    newMessage(msg, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.endpoints.users.selfInfo(socket$$1);
            if (user) {
                if (typeof msg !== 'object') {
                    msg = { text: msg };
                }
                yield this._notifyEvent(pxtCloudApi.Events.ChatNewMessage, Object.assign({}, msg, { name: user.name }), socket$$1);
            }
            return !!user;
        });
    }
    _initializeClient(socket$$1) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield _super("_initializeClient").call(this, socket$$1);
            if (success) {
                if (socket$$1) {
                    socket$$1
                        .on(pxtCloudApi.Events.ChatNewMessage, (msg, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this.newMessage(msg, socket$$1), cb));
                }
            }
            return success;
        });
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
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const userId = endpoint_1.Endpoint.userId(socket$$1);
                const userkey = UsersDBKeys.user(userId);
                this.redisClient.hgetall(userkey, endpoint_1.Endpoint._promiseHandler((reply) => resolve({
                    name: reply && reply.name ? reply.name : '',
                    id: userId,
                }), reject));
            });
        });
    }
    addSelf(user, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = endpoint_1.Endpoint.userId(socket$$1);
            const existed = yield new Promise((resolve, reject) => {
                const userkey = UsersDBKeys.user(userId);
                const multi = this.redisClient.multi()
                    .exists(userkey)
                    .hmset(userkey, {
                    name: user.name || '',
                });
                multi.exec(endpoint_1.Endpoint._promiseHandler((reply) => resolve(!!reply && reply[0]), reject));
            });
            if (!existed) {
                yield this._notifyEvent(pxtCloudApi.Events.UserJoined, userId, user, socket$$1);
            }
            return existed;
        });
    }
    removeSelf(socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = endpoint_1.Endpoint.userId(socket$$1);
            const existed = yield new Promise((resolve, reject) => {
                const userkey = UsersDBKeys.user(userId);
                this.redisClient.del(userkey, endpoint_1.Endpoint._promiseHandler((reply) => resolve(0 !== reply), reject));
            });
            if (existed) {
                yield this._notifyEvent(pxtCloudApi.Events.UserLeft, userId, socket$$1);
            }
            return existed;
        });
    }
    _initializeClient(socket$$1) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield _super("_initializeClient").call(this, socket$$1);
            if (success) {
                if (socket$$1) {
                    socket$$1
                        .on(pxtCloudApi.Events.UserSelfInfo, cb => endpoint_1.Endpoint._fulfillReceivedEvent(this.selfInfo(socket$$1), cb))
                        .on(pxtCloudApi.Events.UserAddSelf, (user, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this.addSelf(user, socket$$1), cb))
                        .on(pxtCloudApi.Events.UserRemoveSelf, cb => endpoint_1.Endpoint._fulfillReceivedEvent(this.removeSelf(socket$$1), cb));
                }
            }
            return success;
        });
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
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });


const debug = require$$0('pxt-cloud:endpoint:world');
const WorldDBKeys = {
    data: (name) => `data:${name}`,
    dataDiff: (name) => `diff:${name}`,
    nameFromKey: (key) => key.substr(key.indexOf(':') + 1),
};
class WorldEndpoint extends endpoint_1.Endpoint {
    constructor(endpoints, redisClient, socketServer) {
        super(endpoints, redisClient, socketServer, 'world');
        this._debug = debug;
        this._datarepo = new pxtCloudApi.DataRepo();
        this._batchedDiffs = {};
        this._batchedCount = 0;
    }
    syncDataSources() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    setDataSource(name, source) {
        return this._datarepo.setDataSource(name, source);
    }
    deleteDataSource(name) {
        return this._datarepo.deleteDataSource(name);
    }
    pullAllData(socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            const tencdata = yield this._pullAllData(socket$$1);
            return tencdata.map(({ name, data }) => ({ name, data: pxtCloudApi.DataRepo.decode(data) }));
        });
    }
    pullData(name, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            return pxtCloudApi.DataRepo.decode(yield this._pullData(name, socket$$1));
        });
    }
    pushAllData(socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            this._datarepo.names.forEach((name) => __awaiter(this, void 0, void 0, function* () { return yield this.pushData(name, socket$$1); }));
        });
    }
    pushData(name, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            const diff = this._datarepo.calcDataDiff(name);
            if (diff) {
                yield this.pushDataDiff(name, diff, socket$$1);
            }
        });
    }
    pushDataDiff(name, diff, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            const encdiff = pxtCloudApi.DataRepo.encodeArray(diff);
            yield this._pushDataDiff(name, encdiff);
        });
    }
    _initializeClient(socket$$1) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield _super("_initializeClient").call(this, socket$$1);
            if (success) {
                if (socket$$1) {
                    socket$$1
                        .on(pxtCloudApi.Events.WorldPullAllData, cb => endpoint_1.Endpoint._fulfillReceivedEvent(this._pullAllData(socket$$1), cb));
                    socket$$1
                        .on(pxtCloudApi.Events.WorldPullData, (name, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this._pullData(name, socket$$1), cb));
                    socket$$1
                        .on(pxtCloudApi.Events.WorldPushAllData, (tencdata, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this._pushAllData(tencdata, socket$$1), cb));
                    socket$$1
                        .on(pxtCloudApi.Events.WorldPushData, ({ name, encdata }, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this._pushData(name, encdata, socket$$1), cb));
                    socket$$1
                        .on(pxtCloudApi.Events.WorldPushDataDiff, ({ name, encdiff }, cb) => endpoint_1.Endpoint._fulfillReceivedEvent(this._pushDataDiff(name, encdiff, socket$$1), cb));
                }
            }
            return success;
        });
    }
    _pullAllData(socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            const datakeys = ['hack:globals'];
            const tencdata = [];
            for (const datakey of datakeys) {
                const name = WorldDBKeys.nameFromKey(datakey);
                tencdata.push({ name, data: yield this._pullData(name) });
            }
            return tencdata;
        });
    }
    _pullData(name, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            const multi = this._batchedDiffs[name];
            if (multi) {
                yield new Promise((resolve, reject) => multi.exec(endpoint_1.Endpoint._promiseHandler(resolve, reject)));
            }
            let encdata = yield new Promise((resolve, reject) => this.redisClient.get(WorldDBKeys.data(name), endpoint_1.Endpoint._binaryPromiseHandler(resolve, reject)));
            const encdiff = yield this._pullDataDiff(name);
            if (encdiff && encdiff.length > 0) {
                let current = encdata ? pxtCloudApi.DataRepo.decode(encdata) : {};
                current = pxtCloudApi.DataRepo.applyDataDiff(current, pxtCloudApi.DataRepo.decode(encdiff));
                encdata = pxtCloudApi.DataRepo.encode(current);
                yield this._pushData(name, encdata, socket$$1);
                yield this._deleteAllPushedDiff(name);
            }
            return encdata;
        });
    }
    _pullDataDiff(name, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => this.redisClient.xrange(WorldDBKeys.dataDiff(name), '-', '+', endpoint_1.Endpoint._promiseHandler(reply => {
                if (reply && reply.length > 0) {
                    const idFirst = reply[0][0];
                    const idLast = reply[reply.length - 1][0];
                    const encdiff = [];
                    reply.forEach((entry) => {
                        const ikvBlob = entry[1].findIndex(value => value === endpoint_1.EndpointDBKeys.blob);
                        if (-1 !== ikvBlob && ikvBlob < (entry[1].length - 1)) {
                            encdiff.push(Buffer.from(entry[1][ikvBlob + 1], 'binary'));
                        }
                    });
                    resolve(encdiff);
                }
                else {
                    resolve();
                }
            }, reject)));
        });
    }
    _pushAllData(tencdata, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            tencdata.forEach(({ name, data }) => __awaiter(this, void 0, void 0, function* () { return yield this._pushData(name, data, socket$$1); }));
        });
    }
    _pushData(name, encdata, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => this.redisClient.set(WorldDBKeys.data(name), encdata.toString('binary'), endpoint_1.Endpoint._promiseHandler(resolve, reject)));
        });
    }
    _pushDataDiff(name, encdiff, socket$$1) {
        return __awaiter(this, void 0, void 0, function* () {
            let multi = this._batchedDiffs[name];
            if (!multi) {
                multi = this._batchedDiffs[name] = this.redisClient.batch();
            }
            const datadiffKey = WorldDBKeys.dataDiff(name);
            encdiff.forEach(d => multi.xadd(datadiffKey, '*', endpoint_1.EndpointDBKeys.blob, d.toString('binary')));
            if (multi.queue.length >= WorldEndpoint.maxExecBatchedDiffs) {
                yield new Promise((resolve, reject) => multi.exec(endpoint_1.Endpoint._promiseHandler(resolve, reject)));
                const lenDiff = yield new Promise((resolve, reject) => this.redisClient.xlen(datadiffKey, endpoint_1.Endpoint._promiseHandler(resolve, reject)));
                if (lenDiff >= (WorldEndpoint.maxExecBatchedDiffs * WorldEndpoint.factorStreamDiffs)) {
                    yield this._pullData(name);
                }
            }
            yield this._notifyEvent(pxtCloudApi.Events.WorldPushDataDiff, { name, encdiff }, socket$$1);
        });
    }
    _deleteAllPushedDiff(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => this.redisClient.del(WorldDBKeys.dataDiff(name), endpoint_1.Endpoint._promiseHandler(resolve, reject)));
        });
    }
}
WorldEndpoint.maxExecBatchedDiffs = 25;
WorldEndpoint.factorStreamDiffs = 3;
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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });


httpShutdown.extend();







__export(server_config_1$1);
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
