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

Middlewares from parent container are inherited so there is no need to define them once again for every child container.

```typescript

const parentContainer = new Container();
const middleware = () => {
   console.log('middleware');
   return null;
};
parentContainer.addMiddleware(middleware);

const container = new Container(parentContainer);
container.getMiddlewares(); // [middleware]

```
However middlewares registered for a child have no effect on parent

```typescript

const middleware2 = () => console.log('second middleware');
container.addMiddleware(middleware2);

container.getMiddlewares(); // [middleware, middleware2]
parentContainer.getMiddlewares(); // [middleware]
```