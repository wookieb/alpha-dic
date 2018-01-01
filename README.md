# Alpha DIC

[![CircleCI](https://travis-ci.org/wookieb/alpha-dic.svg?branch=master)](https://travis-ci.org/wookieb/alpha-dic)

Flexible Dependency injection container that supports asynchronous service creation

Features:
* Supports named annotations with properties
* Supports service dependencies
* Allows to define service as constructor, (async) factory or any value
* Detects cycle dependencies
* Prevents race condition for concurrent service requests

## Installation
```bash
npm install alpha-dic
```

## Example
```javascript
const dic = require('alpha-dic').create();

dic.definition('my-service')
    .useFactory(async () => {
        const connection = new DatabaseConnection();
        await connection.connect();
        return connection;
    });

dic.get('my-service').then((connection) => {
    // you can be sure that at connection to database is established as it was done in factory already
});

```

Example with dependencies
```javascript 

dic
    .serviceAsFactory('my-service', (serviceB) => {
        return {my: 'service', b: serviceB};
    })
    .dependsOn('my-service-b');

// or
// div.serviceAsFactory('my-service', factory, ['my-service-b']);

dic.serviceAsFactory('my-service-b', () => {
    return {my: 'service-b'};    
});


dic.get('my-service').then((service) => {
    service; // {my: 'service', b: {my: 'service-b'}}
});
```

## Getting instances of services

### One service
```javascript
dic.get('service-name')
    .then(/* ... */)
```

### Multiple services
```javascript
dic.serviceAsFactory('A-service', /* ... */);
dic.serviceAsFactory('A-service-2', /* ... */);
dic.serviceAsFactory('B-service', /* ... */);

dic
    .getByPredicate((service) => {
        return service.name[0] === 'A';    
    })
    .then((services) => {
        services[0]; // instance of A-service
        services[1]; // instance of A-service-2
    });
```
### By annotation

See [annotations section](#annotations)
## Defining services

### As constructor
```javascript
class ServiceClass {

}
dic.serviceAsConstructor('A', ServiceClass); 

dic.get('A')
    .then((service) => {
        service instanceof TestService; // true
    });
```

### As factory
```javascript
dic.serviceAsFactory('A', () => {
    return {service: 'A'};
}); 

dic.get('A')
    .then((service) => {
        service; // {service: 'A'}
    });
```

Since _alpha-dic_ uses Promises internally it's possible to return promise from regular factory.
```javascript
dic.serviceAsFactory('A', () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({service: 'A'});
        }, 100);
    })
}); 

dic.get('A')
    .then((service) => {
        service; // {service: 'A'}
    });
```

### As asynchronous factory
It's possible to asynchronously create instance of service using promises and _serviceAsFactory_. This method is recommended for people that prefers callbacks over promises.

```javascript

dic.serviceAsAsyncFactory('A', (callback) => {
    setTimeout(() => {
        callback(null, {service: 'A'});
    }, 100);
}); 

dic.get('A')
    .then((service) => {
        service; // {service: 'A'}
    });
```

### As value
```javascript
dic.serviceAsValue('config', {some: 'config'});

dic.get('config')
    .then((service) => {
        service; // {some: 'config'}
    });
```

## Defining dependencies
```javascript 
dic.serviceAsConstructor('A', ServiceClass, ['B', 'C']);
// same as
dic.createAsConstructor('A', ServiceClass).dependsOn('B', 'C');
```

### For constructor

```javascript
dic.serviceAsConstructor('A', ServiceClass, ['B', 'C']);

class ServiceClass {
    constructor(B, C) {
        // use B, C dependencies
    }
}
```
### For factory

```javascript
dic.serviceAsFactory('A', function(B, C) {
   // use B, C dependencies
})
    .dependsOn('B', 'C')
```

### For async factory
```javascript
dic.serviceAsAsyncFactory('A', function(B, C, callback) {
   // use B, C dependencies
})
    .dependsOn('B', 'C')
```

### For value
This kind of service ignores dependencies.
If you need to produce final service value that relies on dependencies use Factory instead.

## Cacheability
_Alpha-dic_ allows to control whether new instance of should be created once and cached or create new instance every time.
By default every service is cacheable. 

The example how to disable cache for the service.
```javascript
let called = 0;
dic.serviceAsAsyncFactory('A', function(callback) {
    callback(null, ++called);
})
    .nonCacheable();
    
dic.get('A')
    .then(s => {
        s; // 1
    });

dic.get('A')
    .then(s => {
        s; // 2
    });
```

## Annotations
Each service might have any number of named annotations along with some properties.
This is especially useful for aggregations of related services.

```javascript

const eventListener = (eventName) => {
    return {
        name: 'EventListener',
        event: eventName
    }
};

dic.serviceAsConstructor('listener-1', EventListener1)
    .annotate(eventListener('new-user'));

dic.serviceAsConstructor('listener-2', EventListener2)
    .annotate(eventListener('new-article'));

dic.serviceAsConstructor('listener-3', EventListener2)
    .annotate(eventListener('new-user'));


// for simple aggregations
dic.getByAnnotationName('EventListener')
    .then((services) => {
        services[0]; // instance of listener-1 service
        services[1]; // instance of listener-2 service
        services[2]; // instance of listener-3 service
    });

// for advanced aggregations
dic.getMany(dic.findByAnnotation('EventListener', {event: 'new-user'}))
    .then((services) => {
        services[0]; // instance of listener-1 service
        services[1]; // instance of listener-3 service
    });

```

You can use simpler API for simple annotations
```javascript

const service = dic.serviceAsValue('service', {some: 'service'})
    .annotate('simple', {withSome: 'properties'});

service.getAnnotation('simple'); // {withSome: 'properties'}
```
## API
See JSDoc
* [AlphaDIC](src/AlphaDIC.js)
* [Service](src/Service.js)
 
 
## Contribution
I don't have any specific guidelines for contributors for now. Just create an issue and I'll do my best to help you.