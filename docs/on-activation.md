# Calling function on service activation

Simple feature that allows you to get some extra code ran when service gets created.
You need to register a hook that is a function (async or sync) and returns service instance to use.

Hook are called one-by-one and. If a hook is asynchronous then _alpha-dic_ awaits for promise to be resolved then continues calling other hooks.

```typescript
// via decorator

import {OnActivation, Service} from 'alpha-dic';

@OnActivation(function(service: Foo) {
    console.log('I got called!');
    return service; // this is super important!
})
@Service()
class Foo {
    
}

```

```typescript
// manually via annotation
import {onActivation, activationMiddleware} from 'alpha-dic';

// add annotation to service
container.definitionWithConstructor('service', Foo)
.annotate(
    onActivation((service) => {
        assert.ok(service instanceof Foo);
        return service;
    })
);
```

