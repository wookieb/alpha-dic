# Alpha DIC

[![CircleCI](https://travis-ci.org/wookieb/alpha-dic.svg?branch=master)](https://travis-ci.org/wookieb/alpha-dic)
[![Coverage Status](https://coveralls.io/repos/github/wookieb/alpha-dic/badge.svg?branch=master)](https://coveralls.io/github/wookieb/alpha-dic?branch=master)

Flexible Dependency Injection Container with support for asynchronous service creation, annotations and middlewares.

Features:
* Supports middlewares
* Allows to define service as constructor, (async) factory or a value
* Detects cycle dependencies
* Prevents race condition for concurrent service requests
* Supports annotations
* Simple service definition via container methods or decorators

# Installation
```bash
npm install alpha-dic
```

# Example
```javascript
const dic = require('alpha-dic').create();

dic.definitionWithFactory('my-service', async () => {
        const connection = new DatabaseConnection();
        await connection.connect();
        return connection;
    });

dic.get('my-service').then((connection) => {
    // connection was established in factory
});

```

Example with dependencies
```javascript
const {create, reference} = require('alpha-dic');

const dic = require('alpha-dic').create();

class NotificationCenter {
    constructor(renderer, sender) {
        assert.ok(renderer instanceof EmailRenderer);
        // connection to SMTP was established in factory
        assert.ok(sender instanceof Nodemailer);
    }
    async sendEmail(to, type, vars) {
        // render email
        // send it via sender
    }
}

dic.definitionWithConstructor('EmailRenderer', EmailRenderer);
dic.definitionWithFactory('EmailSender', async () => {
    const mailer = new NodeMailer();
    
    // establish connection before returning mailer instance
    await mailer.connectToSMTP();
    return mailer;
});

dic.definitionWithConstructor('NotificationCenter', NotificationCenter)
    .withArgs(
        reference('EmailRenderer'), 
        reference('EmailSender')
    );

dic.get('NotificationCenter')
    .then((center) => {
        return center.sendEmail('admin@example.com', 'limits-exceeded', {})
    })
```


# Usage details

## Simple rules
1) container.get always returns a promise. Doesn't matter whether service is created synchronously or asynchronously since container will convert to promise either way.
 
```javascript
dic.definitionWithConstructor('EmailRenderer', EmailRenderer);

// service might be created synchronously but container converts it to a promise
const renderer = dic.get('EmailRenderer');
assert.ok(renderer instanceof Promise);


dic.definitionWithFactory('EmailSender', async () => {
    const mailer = new NodeMailer();
    
    // establish connection before returning mailer instance
    await mailer.connectToSMTP();
    return mailer;
});

const sender = dic.get('EmailSender');
// exactly the same promise returned by EmailSender factory
assert.ok(sender instanceof Promise);
```

2) All services are created only once. _alpha-dic_ does not support scopes just yet.
```javascript
dic.definitionWithConstructor('EmailRenderer', EmailRenderer);

assert.ok(dic.get('EmailRenderer') === dic.get('EmailRenderer')); // exactly the same promise = exactly the same service
```

## Defining services
There are 3 methods to define a service. Via constructor, via factory or just a value.

```javascript
// service as an instance of given class 
dic.definitionWithConstructor('serviceName', SomeClass);

// factory will be called
dic.definitionWithFactory('serviceName', () => {
    // factory responsible for service creation
    // might be synchronous or asynchronous (must return a promise)
});

// given will be treated as service
dic.definitionWithValue('serviceName', {service: 'instance'});
```

## Service arguments
Factory and Constructor might receive some methods. You can provide regular values or special objects that will be resolved upon service creation.

```javascript
const {reference} = require('alpha-dic');

dic.definitionWithFactory('serviceName', (simpleValue, service) => {
   assert.strictEqual(simpleValue, 'some simple value');
   assert.ok(service) // some service instance
})
.withArgs(
    'some simple value',
    reference('service.name')
)
```

There are few options to inject a service or collection of services
```javascript
reference('service.name') // resolves to a service for given name

// resolves to a service that definition satisfies given predicate
// throws an error if multiple services found
reference.predicate(definition => true); 

// resolves to a service that definition contains an annotation that satisfies given predicate
// throws an error if multiple services found
reference.annotation(annotation => true);

// resolves to a collection of services that definition satisfies given predicate
reference.multi.predicate(definition => true);

// resolves to a collection of services that definition contains an annotation that satisfies given predicate
reference.multi.annotation(annotation => true)
```

If resolving an argument will lead to circular dependence a service won't be created and error will be thrown with details about the path that led to circular dependency.

## Decorators
Creating service definition via container (`definitionWithConstructor` etc) might be a tedious and error-prone work. That's why _alpha-dic_ supports decorators for classes.

NOTE! Hopefully this is obvious but Decorators are not supported by node natively. You need to use Typescript (highly recommended) or other transpiler (like Babel) to make it work.

```typescript
const {Service, Annotation, Inject} = require('alpha-dic');

@Service() // you can also provide a name @Service('name'). By default class/function name inferred.
@Annotation({name: 'extraAnnotation'})
export class NotificationCenter {
    
    @Inject('superExtraService')
    public extraService: ExtraService;
    
    constructor(
        @Inject('EmailRenderer') emailRenderer: EmailRenderer, 
        @Inject('EmailSender') emailSender: EmailSender) {
    }
}

```

### Setup
First you need to create a container and tell @Service decorator to use it in ordeer to automatically registers service definitions.
Without it you'll need to register them manually (see below). I believe this is not intended that's why _alpha-dic_ display special warning in that case.
```typescript
import {Service, Container} from 'alpha-dic';

const container = new Container();
Service.useContainer(container);

import './NotificationCenter'; // require file or all files that contains classes with @Service decorators
```

If you really wish to register them manually set environment variable ```ALPHA_DIC_NO_SERVICE_CONTAINER=1```first, then register a definition.
```javascript
const {getDefinitionForClass, Container} = require('alpha-dic');
const {NotificationCenter} = require('./NotificationCenter');

const container = new Container();
container.registerDefinition(getDefinitionForClass(NotificationCenter));
```

### Limitations
You can define only one service definition per class defined via decorators. If you need more you have to create them on container via `definitionWithClass()`.

## Using annotations
Annotation is a value added to service definition. There is no limit of annotations registered.
You can use annotations for metadata, aggregation, extra configuration for middlewares and more.
_alpha-dic_ allows you to retrieve definitions or services based on the annotations (via predicate).

Few usage examples below.
```javascript
const {Reference} = require('alpha-dic');

// every service with that annotation will be treated as validation service
const validation = {name: 'validation'};

class Validator {
    constructor(validations) {
        assert.ok(validations[0] instanceof EmailValidator);
        assert.ok(validations[1] instanceof UserUniquenessValidator);
    }
}
dic.definitionWithConstructor('validator', Validator)
    .withArgs(
        // inject all services that have "validation" annotation
        Reference.multi.annotation(annotation => annotation === validation)
    );
   
dic.definitionWithConstructor('emailValidator', EmailValidator)
    .annotate(validation);

dic.definitionWithConstructor('userUniquenessValidator', UserUniquenessValidator)
    .annotate(validation);

// manually getting services based on annotation predicate
dic.getByPredicate(annotation => annotation === validation)
    .then(validators => {
        assert.ok(validators[0] instanceof EmailValidator);
        assert.ok(validators[1] instanceof UserUniquenessValidator);
    });

```

## Middlewares
Middleware is a function registered to the container that gets called upon service creation. B

```javascript

dic.addMiddleware(function (definition, next) {
    // called in context of container
    assert.ok(this instanceof Container);
    
    console.time(`creating-service: ${definition.name}`);
    const result = next(definition); // calls next middleware or creates a service if there are no middlewares left
    console.timeEnd(`creating-service: ${definition.name}`);
    return result;
})
```

Middleware is responsible for calling `next` function that calls another middleware or create a service. 
That gives a great opportunity to modify the whole flow according to your needs.
In other words it's possible to change or replace whole definition, prevent calling next function and return your own service value, modifying returned service.

Few use cases for middlewares:
* profiler for debugging service creation time
* listeners called for certain services (based on annotations or something else)
* injecting extra services to prevent circular dependencies
* injecting extra arguments to definition (config variables)

### Activation middleware
Activation middleware calls all hooks (one by one) registered via `onActivation()` annotation.

```javascript
const {onActivation, activationMiddleware} = require('alpha-dic');
// register middleware once
dic.addMiddleware(activationMiddleware);


// add annotation to service
dic.definitionWithConstructor('service', SomeServiceClass)
.annotate(
    onActivation((service) => {
        assert.ok(service instanceof SomeServiceClass);
        return service;
    })
);
```

Hook MUST return service value.
Hook MIGHT return a promise, in that case the middleware will wait for its resolution before calling other hook.