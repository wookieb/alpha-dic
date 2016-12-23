# Alpha DIC

Dependency injection container for node.js

Features:
* Supports names annotations with properties
* Supports service dependencies
* Allows to define service as constructor, factory, asynchronous factory
* Detects cycle dependencies
* Uses promises and callbacks - pick your favorite style
* Caches services when needed and prevents race condition for attempts of concurrent service requests

## Installation
```bash
npm install alpha-dic
```

## Example
```js
const dic = require('alpha-dic').create();

dic.serviceAsFactory('my-service', () => {
    return {my: 'service'};
});

dic.get('my-service').then((service) => {
    service; // {my: 'service'}
});
// or via callback
dic.get('my-service', (err, service) => {
    if (err) { /* ... */ }
    service; // {my: 'service'}
});

```

Example with dependencies
```js 

const dic = require('alpha-dic').create();

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
```js
dic.get('service-name')
    .then(/* ... */)
```

### Multiple services
```js
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
```
class ServiceClass {

}
dic.serviceAsConstructor('A', ServiceClass); 

dic.get('A')
    .then((service) => {
        service instanceof TestService; // true
    });
```

### As factory
```
dic.serviceAsFactory('A', () => {
    return {service: 'A'};
}); 

dic.get('A')
    .then((service) => {
        service; // {service: 'A'}
    });
```

Since _alpha-dic_ uses Promises internally it's possible to return promise from regular factory.
```js
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
It's possible to asynchronously define service using promised and _serviceAsFactory_ but this method is created for people that prefers callbacks over promises.

```js

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

## Defining dependencies
```js 
dic.serviceAsConstructor('A', ServiceClass, ['B', 'C']);
// same as
dic.createAsConstructor('A', ServiceClass).dependsOn('B', 'C');
```

## Annotations
Each service might have any number of named annotations along with some properties.
This is especially useful for aggregations of related services.

```js
dic.serviceAsConstructor('listener-1', EventListener1)
    .annotate('EventListener', {event: 'new-user'});

dic.serviceAsConstructor('listener-2', EventListener2)
    .annotate('EventListener', {event: 'new-article'});

dic.serviceAsConstructor('listener-3', EventListener2)
    .annotate('EventListener', {event: 'new-user'});


dic.getByPredicate((service) => {
    return service.hasAnnotation('EventListener') 
        && service.getAnnotation('EventListener').event === 'new-user';
})
    .then((services) => {
        services[0]; // instance of listener-1 service
        services[1]; // instance of listener-3 service
    });
```