/*
 * @module mcon javascript client
 */
(function() {
var SimpleMsgRpc, BeanInvoker, WebSocket;
var __mcon_client_js_version = __mcon_client_js_version;
if(typeof require !== 'undefined') {
    SimpleMsgRpc = require('mcon-common-rpc');
    WebSocket = require('ws');
    __mcon_client_js_version = require('./package.json').version;
} else {
    SimpleMsgRpc = window.SimpleMsgRpc;
    WebSocket = window.WebSocket;
    __mcon_client_js_version = window.__mcon_client_js_version;
}
BeanInvoker = SimpleMsgRpc.BeanInvoker;


/*
 * Declare Module
 */
var mcon = {};


/*
 * Service Manager
 */
mcon.localServices = {}; // serviceId -> serviceBean
mcon.invoke = function(conf, callback) {
    return mcon.rpc.invoke(conf, callback);
};
mcon.invokeLocalService = function(headers, serviceId, methodName, params, callback) {
    var bean = this.localServices[serviceId];
    BeanInvoker.invoke.apply(bean, arguments);
};
mcon.registerService = function(serviceId, serviceBean) {
    this.localServices[serviceId] = serviceBean;
}
mcon.registerService('mcon.ClientEchoTest', {
    echo: function(msg) {
        return 'client echo back: ' + msg;
    }
});


/*
 * Connection Manager
 */
mcon.ws  = null; // WebSocket
mcon.rpc = null; // SimpleMsgRpc
mcon.configConnection = function() {
    var self = this;
    self.rpc = new SimpleMsgRpc({
        msgAdapter: {
            send: function(message) {
                if (self.isConnected()) {
                    self.ws.send(message);
                }
            }
        },
        requestProcessor: {
            invoke: function(headers, serviceId, methodName, params, callback) {
                self.invokeLocalService(headers, serviceId, methodName, params, callback);
            }
        }
    });
};
mcon.isConnected = function() {
    var ws = this.ws;
    if (ws && ws.readyState !== WebSocket.CLOSED) {
        return true;
    } else {
        return false;
    }
};
mcon.connect = function() {
    if (this.isConnected()) {
        return;
    }
    if (this.ws) {
        this.ws.close();
    }
    var self = this;
    var ws = this.ws = new WebSocket('ws://127.0.0.1:' + this.serverWsPort);
    console.info('WebSocket is connection to port ' + this.serverWsPort + '...');
    ws.onopen = function(event) {
        ws.onclose = function() {
            console.info('WebSocket connection is closed.')
        };
        console.info('WebSocket client is connected to the server.')
        self.tick(); // send serviceIds immedately
    };
    ws.onmessage = function(event) {
        self.rpc.processMessage(event.data);
    };
    ws.onerror = function(event) {
        console.error('WebSocket error: ', event);
    };
};


/*
 * Client Tick
 */
mcon.sendMeta = function() {
    this.invoke({
        serviceId: 'mcon.ClientManager',
        methodName: 'updateMeta',
        params: [{
            name: this.name,
            version: this.version,
            serviceIds: Object.keys(this.localServices)
        }]
    }, function(err) {
        if (err) {
            console.error('Mcon Client Tick Error', err);
        }
    });
};
mcon.tick = function() {
    if (this.isConnected()) {
        this.sendMeta();
    } else {
        this.connect();
    }
};


/*
 * Init
 */
mcon.inited  = false;
mcon.name    = '';
mcon.version = 'js-' + __mcon_client_js_version;
mcon.init = function(conf) {
    // check if inited
    if (this.inited) {
        return;
    }

    // init config
    var self = this;
    self.name = conf.name;
    self.version = conf.version || self.version;
    self.serverWsPort = conf.serverWsPort || 8125;

    // init connection
    self.configConnection();
    self.intervalId = setInterval(function() {
        self.tick();
    }, 5000);
    self.tick();

    // mark as inited
    this.inited = true;
};


/*
 * Export Module
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mcon;
} else {
    window.mcon = mcon;
}
})();
