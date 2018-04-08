# Big project tips

As your project grows there are several patterns that might be useful to help with container maintenance.


## Namespace services names
With `createNamespace` helper you can easily create a simple object with service names you can reference later.

```typescript
import {createNamespace, namespaceEntry as r} from 'alpha-dic';

const names = createNamespace({
    worker: r,
    repository: {
        user: r,
        userTemplates: 'user-templates'
    }
});

names.worker; // 'worker'
names.repository.user; // 'repository.user'
names.repository.userTemplates; // 'repository.userTemplates'
names.unknownServiceName; // throws na error


@Service()
class Foo {
    constructor(@Inject(names.repository.user) userRepository) {
        
    }
}
```
## Sanity check test
That's a one of the best life savior. Just try to get instance of all services! 
Stub ones you'd like to omit and check whether container is properly defined (no circular dependencies)

```typescript

describe('sanity check', () => {
    const container = getContainerReference(); // just get an instance of container somehow
    
    // stub some definitions
    
    container.findByName('mongo').useFactory(() => {});
    
    for (const definition of container.findByPredicate(() => true)) {
        it('Service ${definition.name}', () => {
            // if definition is wrong then rejected promise gets returned thus failing your test
            return container.get(definition);
        })
    }
    
})
```