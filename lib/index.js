'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var events = _interopDefault(require('events'));
var redis = _interopDefault(require('redis'));
var require$$0 = _interopDefault(require('debug'));
var socket = _interopDefault(require('socket.io'));
var fs = _interopDefault(require('fs'));
var http = _interopDefault(require('http'));
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



var debug = require$$0('pxt-cloud:redis');
var ClientRedis = (function (_super) {
    __extends(ClientRedis, _super);
    function ClientRedis(port_, host_) {
        if (port_ === void 0) { port_ = server_config_1$1.ServerConfig.redisport; }
        if (host_ === void 0) { host_ = server_config_1$1.ServerConfig.redishost; }
        var _this = _super.call(this) || this;
        _this._redisClient = new redis.RedisClient({ host: host_, port: port_, retry_strategy: ClientRedis._retrystrategy });
        _this._redisClient.on('ready', function () { return debug("connection ready"); });
        _this._redisClient.on('end', function () { return debug("connection ended"); });
        _this._redisClient.on('error', function (error) { return debug(error); });
        return _this;
    }
    ClientRedis.callbackHandler = function (err, reply) {
        if (err) {
            debug(err);
        }
    };
    ClientRedis._retrystrategy = function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            debug(options.error);
            return new Error('connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            debug('total retry timeout');
            return new Error('retry time exhausted');
        }
        if (options.attempt > 10) {
            debug('max attempts');
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
    Object.defineProperty(ClientRedis, "redisAPI", {
        get: function () {
            return this.singleton._redisClient;
        },
        enumerable: true,
        configurable: true
    });
    ClientRedis.prototype.dispose = function () {
        this._redisClient.quit();
    };
    ClientRedis._singleton = new ClientRedis();
    return ClientRedis;
}(events.EventEmitter));
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


var debug = require$$0('pxt-cloud:endpoint');
var Endpoint = (function (_super) {
    __extends(Endpoint, _super);
    function Endpoint(server, nsp) {
        var _this = _super.call(this) || this;
        _this._io = null;
        if ('httpServer' in server) {
            server = server.httpServer;
        }
        _this._attach(socket(server).of("/" + (nsp || '')));
        return _this;
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
            debug(io.name + " client connected from " + socket$$1.handshake.address);
            _this._onConnection(socket$$1);
            socket$$1.on('disconnect', function (reason) {
                debug(io.name + " client disconnected from " + socket$$1.handshake.address);
                _this._onDisconnection(socket$$1);
            });
        });
    };
    Endpoint.prototype._onConnection = function (socket$$1) {
    };
    Endpoint.prototype._onDisconnection = function (socket$$1) {
    };
    return Endpoint;
}(events.EventEmitter));
exports.Endpoint = Endpoint;
});

var endpoint_base$1 = unwrapExports(endpoint_base);
var endpoint_base_1 = endpoint_base.Endpoint;

var endpoint_base$2 = /*#__PURE__*/Object.freeze({
	default: endpoint_base$1,
	__moduleExports: endpoint_base,
	Endpoint: endpoint_base_1
});

var client_redis_1$1 = ( client_redis$2 && client_redis$1 ) || client_redis$2;

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


var debug = require$$0('pxt-cloud:endpoint.world');
exports.keys = {
    userId: function (id) { return "user:" + id; },
    users: 'users',
};
var WorldEndpoint = (function (_super) {
    __extends(WorldEndpoint, _super);
    function WorldEndpoint(server) {
        return _super.call(this, server, 'pxt-cloud.world') || this;
    }
    WorldEndpoint.prototype.addUser = function (user, id) {
        var success = !!user && !!id;
        if (success) {
            success = client_redis_1$1.ClientRedis.redisAPI.sadd(exports.keys.users, id, client_redis_1$1.ClientRedis.callbackHandler);
        }
        if (success) {
            success = client_redis_1$1.ClientRedis.redisAPI.hmset(exports.keys.userId(id), { 'username': user.name }, client_redis_1$1.ClientRedis.callbackHandler);
        }
        return success;
    };
    WorldEndpoint.prototype.removeUser = function (id) {
        var success = !!!id;
        if (success) {
            success = client_redis_1$1.ClientRedis.redisAPI.hdel(exports.keys.userId(id), ['username'], client_redis_1$1.ClientRedis.callbackHandler);
        }
        if (success) {
            success = client_redis_1$1.ClientRedis.redisAPI.srem(exports.keys.users, id, client_redis_1$1.ClientRedis.callbackHandler);
        }
        return success;
    };
    WorldEndpoint.prototype._onConnection = function (socket$$1) {
        var _this = this;
        _super.prototype._onConnection.call(this, socket$$1);
        socket$$1.on('user_add', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.addUser.apply(_this, args);
        });
        socket$$1.on('user_remove', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _this.removeUser.apply(_this, args);
        });
    };
    return WorldEndpoint;
}(endpoint_base_1$1.Endpoint));
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




var debug = require$$0('pxt-cloud:server');
var Server = (function () {
    function Server(port_, host_) {
        if (port_ === void 0) { port_ = server_config_1$1.ServerConfig.port; }
        if (host_ === void 0) { host_ = server_config_1$1.ServerConfig.host; }
        this._httpServer = http.createServer(Server._handler).withShutdown();
        this._httpServer.listen(port_, host_, function () { return debug("listening on " + host_ + " at port " + port_); });
        this._httpServer.on('close', function () { return debug("closed"); });
        this._httpServer.on('error', function (error) { return debug(error); });
        this._worldEndpoint = new endpoint_world_1$1.WorldEndpoint(this._httpServer);
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
    Object.defineProperty(Server, "httpServer", {
        get: function () {
            return this.singleton._httpServer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Server, "worldAPI", {
        get: function () {
            return this.singleton._worldEndpoint;
        },
        enumerable: true,
        configurable: true
    });
    Server.prototype.dispose = function () {
        this._httpServer.close();
    };
    Server._singleton = new Server();
    return Server;
}());
exports.Server = Server;
process.on('SIGINT', function () {
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

var require$$0$1 = ( server$2 && server$1 ) || server$2;

var built = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require$$0$1);
});

var index = unwrapExports(built);

module.exports = index;
