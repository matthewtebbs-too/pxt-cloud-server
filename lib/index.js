'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var http = _interopDefault(require('http'));
var path = _interopDefault(require('path'));
var debug = _interopDefault(require('debug'));
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
    Object.defineProperty(ServerConfig, "defaultUri", {
        get: function () {
            return "http://" + ServerConfig.hostname + ":" + ServerConfig.port;
        },
        enumerable: true,
        configurable: true
    });
    ServerConfig.hostname = process.env.PXT_CLOUD_HOSTNAME || 'localhost';
    ServerConfig.port = process.env.PXT_CLOUD_PORT ? parseInt(process.env.PXT_CLOUD_PORT, 10) : 3000;
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

var server = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




var debug$$1 = debug('pxt-cloud:server');
var Server = (function () {
    function Server(port, hostname) {
        if (port === void 0) { port = server_config_1$1.ServerConfig.port; }
        if (hostname === void 0) { hostname = server_config_1$1.ServerConfig.hostname; }
        this._server = http.createServer(Server._handler);
        this._server.listen(port, hostname, function () { return debug$$1("server listening on " + hostname + " at port " + port); });
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
    Object.defineProperty(Server.prototype, "httpserver", {
        get: function () {
            return this._server;
        },
        enumerable: true,
        configurable: true
    });
    Server.prototype._onDispose = function () {
        this._server.close();
    };
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

var require$$1 = ( endpoint_world$2 && endpoint_world$1 ) || endpoint_world$2;

var built = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(endpoint_base_1$1);
__export(require$$1);
__export(server_1$1);
__export(server_config_1$1);
});

var index = unwrapExports(built);

module.exports = index;
