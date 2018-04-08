# Middlewares
Middleware is a function registered to the container that gets called upon service creation.

Middleware is responsible for calling `next` function that creates a service (or call other middleware). 
That gives a great opportunity to modify the whole flow according to your needs. 
For example it's possible to change or replace whole definition, prevent calling next function and return your own service value or modify returned service.

```javascript
dic.addMiddleware(function (definition, next) {
    // called in context of container
    assert.ok(this instanceof Container);
    
    console.time(`creating-service: ${definition.name}`);
    const service = next(definition); // calls next middleware or creates a service if there are no middlewares left
    console.timeEnd(`creating-service: ${definition.name}`);
    return service;
});
```

Few use cases for middlewares:
* profiler for debugging service creation time
* listeners called for certain services (based on annotations or something else)
* injecting extra services to prevent circular dependencies
* injecting extra arguments to definition ([injecting configuration](#injecting-configuration-values))

## Activation middleware


## Config middleware - Injecting configuration values


Setup (not needed if container created via `createStandard`)
```typescript

import {configMiddleware, configProviderForObject} from 'alpha-dic'
container.addMiddleware(
    // add middleware
    configMiddleware(
        configProviderForObject({
            database: 'mongo://localhost/test',
            redis: {
                user: 'username',
                password: '$secretPa##W0rd',
                host: 'my.redis.example.com',
                port: '8017'     
            },
            env: process.env
        })
    )
)
```

```typescript
// via decorators

import {Service, Config} from 'alpha-dic'
// injected in constructor
@Service()
class RedisCache {
    constructor(
        @Config('redis.host') host: string, // throws an error if config at given path does not exist
        @Config('redis.port', 27017) port: number, // uses 27017 as default value if config at given path does not exist
        @Config('redis.user') user: string,
        @Config('redis.password') password: string
    ) {
        
    }
}


//  injected to property
@Service()
class MongoConnection {
    
    @Config('database')
    connectionString: string;
}

```


```typescript
import {config} from 'alpha-dic';

// injected manually
container.definitionWithFactory('foo', (secret: string) => { /* */ })
    .withArgs(config('env.JWT_SECRET'));
```