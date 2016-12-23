# Alpha DIC

Dependency injection container for node.js

Features:
* Supports named annotations with properties
* Supports service dependencies
* Allows to define service as constructor, factory, asynchronous factory
* Detects cycle dependencies
* Uses promises and callbacks - pick your favorite style
* Caches services when needed and prevents race condition for concurrent service requests

## Table of contents
* [Alpha DIC](#alpha-dic)
  * [Installation](#installation)
  * [Example](#example)
  * [Getting instances of services](#getting-instances-of-services)
     * [One service](#one-service)
     * [Multiple services](#multiple-services)
     * [By annotation](#by-annotation)
  * [Defining services](#defining-services)
     * [As constructor](#as-constructor)
     * [As factory](#as-factory)
     * [As asynchronous factory](#as-asynchronous-factory)
  * [Defining dependencies](#defining-dependencies)
  * [Annotations](#annotations)
  * [API](#api)
  * [Contribution](#contribution)
      
## Installation
```bash
npm install alpha-dic
```

## Example
```javascript
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
```javascript 

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
It's possible to asynchronously create instance of service using promises and _serviceAsFactory_ but this method is recommended for people that prefers callbacks over promises.

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

## Defining dependencies
```javascript 
dic.serviceAsConstructor('A', ServiceClass, ['B', 'C']);
// same as
dic.createAsConstructor('A', ServiceClass).dependsOn('B', 'C');
```

## Annotations
Each service might have any number of named annotations along with some properties.
This is especially useful for aggregations of related services.

```javascript
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

## API
See JSDoc
* [AlphaDIC](src/AlphaDIC.js)
* [Service](src/Service.js)
 
 
## Contribution
I don't have any specific guidelines for contributors for now. Just create an issue and I'll do my best to help you.