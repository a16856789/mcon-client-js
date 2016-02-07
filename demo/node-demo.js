var mcon = require('../mcon-client');

mcon.init({
    name: 'node-empty-client',
    serverWsPort: 8125 // default is 8125
});

setTimeout(function() {
    mcon.invoke({
        serviceId: 'mcon.ClientEchoTest',
        methodName: 'echo',
        params: ['123']
    }, function(err, res) {
        console.log(arguments);
    })
}, 1000);
