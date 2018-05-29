'use strict';

var socket = require('socket.io');
var fs = require('fs');
var http = require('http');
var path = require('path');
var require$$0 = require('debug');

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var config = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
var Config = (function () {
    function Config() {
    }
    Config.hostname = process.env.PXT_CLOUD_HOSTNAME || 'localhost';
    Config.port = process.env.PXT_CLOUD_PORT ? parseInt(process.env.PXT_CLOUD_PORT, 10) : 3000;
    Config.defaultUri = "http://" + Config.hostname + ":" + Config.port;
    return Config;
}());
exports.Config = Config;
});

unwrapExports(config);
var config_1 = config.Config;

var server = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




var debug = require$$0('pxt-cloud:server');
var Server = (function () {
    function Server(port, hostname) {
        if (port === void 0) { port = config.Config.port; }
        if (hostname === void 0) { hostname = config.Config.hostname; }
        this._server = http.createServer(Server._handler);
        this._server.listen(port, hostname, function () { return debug("server listening on " + hostname + " at port " + port); });
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

unwrapExports(server);
var server_1 = server.Server;

var endpoint_base = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


var debug = require$$0('pxt-cloud:endpoint');
var Endpoint = (function () {
    function Endpoint(server$$1, nsp) {
        this._io = null;
        if (server$$1 instanceof server.Server) {
            server$$1 = server$$1.httpserver;
        }
        this._attach(socket(server$$1).of("/" + (nsp || '')));
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
    return Endpoint;
}());
exports.Endpoint = Endpoint;
});

unwrapExports(endpoint_base);
var endpoint_base_1 = endpoint_base.Endpoint;

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
}(endpoint_base.Endpoint));
exports.WorldEndpoint = WorldEndpoint;
});

unwrapExports(endpoint_world);
var endpoint_world_1 = endpoint_world.WorldEndpoint;

var built = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(config);
__export(endpoint_base);
__export(endpoint_world);
__export(server);
});

var index = unwrapExports(built);

module.exports = index;
