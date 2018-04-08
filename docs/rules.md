# Rules

## Container always returns a promise
`container.get` ALWAYS returns a promise. Doesn't matter whether service is created synchronously or asynchronously since container will convert it to a promise either way.

```typescript
@Service()
class EmailRenderer {}


// service might be created in synchronous way but container converts it to a promise
const renderer = container.get('EmailRenderer');
assert.ok(renderer instanceof Promise);

container.definitionWithFactory('EmailSender', async () => {
    const mailer = new NodeMailer();
    
    // establish connection before returning mailer instance
    await mailer.connectToSMTP();
    return mailer;
});

const sender = container.get('EmailSender');
assert.ok(sender instanceof Promise);
```

## Services are created only once

All services are created only once. _alpha-dic_ does not support scopes just yet. If you have a really good use case for them please create an issue with your example.

```typescript
container.definitionWithConstructor('EmailRenderer', EmailRenderer);

assert.ok(dic.get('EmailRenderer') === dic.get('EmailRenderer')); // exactly the same promise = exactly the same service
```