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
```typescript
import {createStandard} from 'alpha-dic';

const container = createStandard();
// if you're defining services via decorators
// preloadServiceModules(container, './path/to/service/modules/*')

container.definitionWithFactory('my-service', async () => {
        const connection = new DatabaseConnection();
        await connection.connect();
        return connection;
    });

container.get('my-service').then((connection) => {
    // connection has been established in factory
});

```

Example with dependencies and decorators
```typescript
import {createStandard, reference, Service, OnActivation} from 'alpha-dic';

const container = createStandard();

@Service()
class NotificationCenter {
    constructor(@Inject('EmailRenderer') renderer, @Inject('EmailSender') sender) {
        assert.ok(renderer instanceof EmailRenderer);
        // connection to SMTP was established in factory
        assert.ok(sender instanceof Nodemailer);
    }
    async sendEmail(to, type, vars) {
        // render email
        // send it via sender
    }
}

@Service()
class EmailRenderer {
    
}

@Service()
@OnActivation(async (mailer) => {
    await mailer.connectToSMTP();
    return mailer;
})
class EmailSender {
    
}

container.get('NotificationCenter')
    .then((centre) => {
        return centre.sendEmail('admin@example.com', 'limits-exceeded', {})
    })
```

* [Simple usage rules](./docs/rules.md)
* [Defining services](./docs/defining-services.md)
* [Decorators](./docs/decorators.md)
* [Annotations](./docs/annotations.md)
* [Middlewares](./docs/middlewares.md)
* [Injecting configuration values](./docs/configuration.md)
* [Hooks - @OnActivation, onActivation](./docs/on-activation.md)
* [Deprecating services](./docs/deprecating.md)
* [Big projects tips](./docs/big-project-tips.md)
* [Example](./example)
