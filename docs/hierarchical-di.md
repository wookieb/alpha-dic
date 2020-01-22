# Hierarchical DI

As many other containers _alpha-dic_ supports hierarchical DI as well. You can assign one container as parent of another. Every attempt to get a service that is not defined in child container will be forwarded to parent container as so on until it reaches a container without a parent.
```typescript

const parentContainer = new Container();

parentContainer.definition('A')
    .useValue('serviceA');

const container = new Container(parentContainer);

container.definition('B')
    .useValue('serviceB');


await container.get('A'); // 'serviceA'
await container.get('B'); // 'serviceB';

await parentContainer.get('A'); // Error: Service not found
```

Finding definitions by predicate, name or annotation predicates takes parent's definitions into account as well
```typescript

container.findByPredicate(() => true); // [Definition for ('A'), Definition for ('B')]
parentContainer.findByPredicate(() => true); // [Definition for ('A')]

```

## Middlewares

However middlewares registered for a child have no effect on parent since every container has it's own set of middlewares.

```typescript

const middleware2 = () => console.log('second middleware');
container.addMiddleware(middleware2);

container.getMiddlewares(); // [middleware, middleware2]
parentContainer.getMiddlewares(); // [middleware]
```