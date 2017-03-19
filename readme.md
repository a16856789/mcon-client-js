# Mcon javascript client

## Usage

| API | description |
| --- | --- |
| mcon.init | Init |
| mcon.registService | Register Local Service to Server |
| mcon.invoke | Asyn invoke Server's Method |

### Init

```javascript
mcon.init({
    name: 'node-empty-client',
    serverWsPort: 8125 // default is 8125
});
```

### Register Service

```javascript
// @param serviceId    service id
// @param serviceBean  service bean
// @see BeanInvoker.invoke(...)
mcon.registService('mcon.ClientEchoTest', {
    // method has the same as methodName
    echo: function(msg) {
        return 'client echo back: ' + msg;
    },
    // or named like "invoke$methodName"
    invokeSay: function(headers, params, callback) {
    }
});
```

### Invoke Service

```javascript
// @param conf.headers.oneway   the call back will be invoked immediately if oneway is true
// @param conf.headers.timeout  timeout value in ms
// @param conf.serviceId        service id
// @param conf.methodName       method name
// @param conf.params           method parameters, usually an array
// @see BeanInvoker.invoke(...)
mcon.invoke({
    serviceId: '',
    methodName: '',
    params: []
}, function(error, response) {
    // ...
});
```


