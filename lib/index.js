'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var redis = _interopDefault(require('redis'));
var debug = _interopDefault(require('debug'));
var fs = _interopDefault(require('fs'));
var http = _interopDefault(require('http'));
var httpShutdown = _interopDefault(require('http-shutdown'));
var path = _interopDefault(require('path'));
var socket = _interopDefault(require('socket.io'));

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var server_config = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
var ServerConfig = (function () {
    function ServerConfig() {
    }
    Object.defineProperty(ServerConfig, "serverUri", {
        get: function () {
            return "http://" + ServerConfig.host + ":" + ServerConfig.port;
        },
        enumerable: true,
        configurable: true
    });
    ServerConfig.host = process.env.PXT_CLOUD_HOST || 'localhost';
    ServerConfig.port = process.env.PXT_CLOUD_PORT ? parseInt(process.env.PXT_CLOUD_PORT, 10) : 3000;
    ServerConfig.redishost = process.env.PXT_CLOUD_REDISHOST || 'localhost';
    ServerConfig.redisport = process.env.PXT_CLOUD_REDISPORT ? parseInt(process.env.PXT_CLOUD_REDISPORT, 10) : 6379;
    return ServerConfig;
}());
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


var debug$$1 = debug('pxt-cloud:redis');
var ClientRedis = (function () {
    function ClientRedis(port_, host_) {
        if (port_ === void 0) { port_ = server_config_1$1.ServerConfig.redisport; }
        if (host_ === void 0) { host_ = server_config_1$1.ServerConfig.redishost; }
        this._redisclient = new redis.RedisClient({ host: host_, port: port_, retry_strategy: ClientRedis._retrystrategy });
        this._redisclient.on('ready', function () { return debug$$1("connection ready"); });
        this._redisclient.on('end', function () { return debug$$1("connection ended"); });
        this._redisclient.on('error', function (error) { return debug$$1(error); });
    }
    ClientRedis._retrystrategy = function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            debug$$1(options.error);
            return new Error('connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            debug$$1('total retry timeout');
            return new Error('retry time exhausted');
        }
        if (options.attempt > 10) {
            debug$$1('max attempts');
            return new Error('max retry attempts reached');
        }
        return Math.min(options.attempt * 100, 3000);
    };
    Object.defineProperty(ClientRedis, "singleton", {
        get: function () {
            return this._singleton;
        },
        enumerable: true,
        configurable: true
    });
    ClientRedis.prototype.dispose = function () {
        this._redisclient.quit();
    };
    ClientRedis._singleton = new ClientRedis();
    return ClientRedis;
}());
exports.ClientRedis = ClientRedis;
});

var client_redis$1 = unwrapExports(client_redis);
var client_redis_1 = client_redis.ClientRedis;

var client_redis$2 = /*#__PURE__*/Object.freeze({
	default: client_redis$1,
	__moduleExports: client_redis,
	ClientRedis: client_redis_1
});

var server = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


httpShutdown.extend();


var debug$$1 = debug('pxt-cloud:server');
var Server = (function () {
    function Server(port_, host_) {
        if (port_ === void 0) { port_ = server_config_1$1.ServerConfig.port; }
        if (host_ === void 0) { host_ = server_config_1$1.ServerConfig.host; }
        this._httpserver = http.createServer(Server._handler).withShutdown();
        this._httpserver.listen(port_, host_, function () { return debug$$1("listening on " + host_ + " at port " + port_); });
        this._httpserver.on('close', function () { return debug$$1("closed"); });
        this._httpserver.on('error', function (error) { return debug$$1(error); });
    }
    Server._handler = function (request, response) {
        fs.readFile(path.join(__dirname, 'public') + '/index.html', function (error, data) {
            if (error) {
                response.writeHead(500);
            }
            else {
                response.writeHead(200);
                response.end(data);
            }
        });
    };
    Object.defineProperty(Server, "singleton", {
        get: function () {
            return this._singleton;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Server.prototype, "httpserver", {
        get: function () {
            return this._httpserver;
        },
        enumerable: true,
        configurable: true
    });
    Server.prototype.dispose = function () {
        this._httpserver.close();
    };
    Server._singleton = new Server();
    return Server;
}());
exports.Server = Server;
});

var server$1 = unwrapExports(server);
var server_1 = server.Server;

var server$2 = /*#__PURE__*/Object.freeze({
	default: server$1,
	__moduleExports: server,
	Server: server_1
});

var server_1$1 = ( server$2 && server$1 ) || server$2;

var endpoint_base = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


var debug$$1 = debug('pxt-cloud:endpoint');
var Endpoint = (function () {
    function Endpoint(server, nsp) {
        this._io = null;
        if (server instanceof server_1$1.Server) {
            server = server.httpserver;
        }
        this._attach(socket(server).of("/" + (nsp || '')));
    }
    Object.defineProperty(Endpoint.prototype, "io", {
        get: function () {
            return this._io;
        },
        enumerable: true,
        configurable: true
    });
    Endpoint.prototype._attach = function (io) {
        var _this = this;
        this._io = io;
        io.on('connection', function (socket$$1) {
            debug$$1(io.name + " client connected from " + socket$$1.handshake.address);
            _this._onConnection(socket$$1);
            socket$$1.on('disconnect', function (reason) {
                debug$$1(io.name + " client disconnected from " + socket$$1.handshake.address);
                _this._onDisconnection(socket$$1);
            });
        });
    };
    return Endpoint;
}());
exports.Endpoint = Endpoint;
});

var endpoint_base$1 = unwrapExports(endpoint_base);
var endpoint_base_1 = endpoint_base.Endpoint;

var endpoint_base$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_base$1,
	__moduleExports: endpoint_base,
	Endpoint: endpoint_base_1
});

var endpoint_base_1$1 = ( endpoint_base$2 && endpoint_base$1 ) || endpoint_base$2;

var endpoint_world = createCommonjsModule(function (module, exports) {
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });

var debug$$1 = debug('pxt-cloud:endpoint.world');
var WorldEndpoint = (function (_super) {
    __extends(WorldEndpoint, _super);
    function WorldEndpoint(server) {
        return _super.call(this, server, 'pxt-cloud.world') || this;
    }
    WorldEndpoint.prototype._onConnection = function (socket$$1) {
        socket$$1.emit('login');
    };
    WorldEndpoint.prototype._onDisconnection = function (socket$$1) {
    };
    return WorldEndpoint;
}(endpoint_base_1$1.Endpoint));
exports.WorldEndpoint = WorldEndpoint;
});

var endpoint_world$1 = unwrapExports(endpoint_world);
var endpoint_world_1 = endpoint_world.WorldEndpoint;

var endpoint_world$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_world$1,
	__moduleExports: endpoint_world,
	WorldEndpoint: endpoint_world_1
});

var require$$0 = ( client_redis$2 && client_redis$1 ) || client_redis$2;

var require$$2 = ( endpoint_world$2 && endpoint_world$1 ) || endpoint_world$2;

var built = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require$$0);
__export(endpoint_base_1$1);
__export(require$$2);
__export(server_1$1);
__export(server_config_1$1);
var client_redis_1 = require$$0;
var server_1 = server_1$1;
process.on('SIGINT', function () {
    client_redis_1.ClientRedis.singleton.dispose();
    server_1.Server.singleton.dispose();
});
});

var index = unwrapExports(built);

module.exports = index;
