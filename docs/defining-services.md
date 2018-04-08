# Defining services
There are 4 methods to define a service. Via constructor, via factory, a value or @Service decorator.

```typescript

// service as an instance of given class 
container.definitionWithConstructor('serviceName', SomeClass);

container.definitionWithFactory('serviceName', () => {
    // factory responsible for service creation
    // might be synchronous or asynchronous (must return a promise)
});

// given value will be treated as service
container.definitionWithValue('serviceName', {service: 'instance'});

@Service()
class Foo {
    
}
```

## Defining dependencies
Services might have injected any values or references to other services.

```javascript
import {reference} from 'alpha-dic';

container.definitionWithFactory('serviceName', (simpleValue, service) => {
   assert.strictEqual(simpleValue, 'some simple value');
   assert.ok(service) // service "service.name"
})
    .withArgs('some simple value', reference('service.name'));
```

## Defining dependencies with decorators
```typescript
import {Reference, Service} from 'alpha-dic'

@Service()
class Foo {
    
    @Inject('Bar1')
    bar1Service: Bar1;
    
    @Inject('bar2.service')
    bar2Service: Bar2;
    
    constructor(@Inject('service.name') private service: any) {
        
    }   
}


@Service()
class Bar1 {
    
}

@Service('bar2.service')
class Bar2 {
    
}
```

## Referencing services

The most common way to get other service is referencing it by name. However _alpha-dic_ allows to use predicates to obtain reference to services you're looking for.
```javascript
// simple reference by name
reference('service.name') // resolves to a service for given name
// same as
@Inject('service.name')
@Inject(Reference.one.name('service.name'));


// resolves to a service that definition satisfies given predicate
// throws an error if multiple services found
// find a service with more than 10 annotations
reference.predicate(definition => definition.annotations.length > 10); 
// same as
@Inject(Reference.one.predicate(definition => definition.annotations.length > 10));


// resolves to a service that definition contains an annotation that satisfies given predicate
// throws an error if multiple services found
// find a service with annotation that contains name "repository"
reference.annotation(annotation => annotation && annotation.name === 'repository');
// same as
@Inject(Reference.one.predicate(annotation => annotation && annotation.name === 'repository'));


// resolves to a collection of services that definition satisfies given predicate
// find all services with "repository." prefix
reference.multi.predicate(definition => definition.name.startsWith('repository.'));
// same as
@Inject(Reference.multi.predicate(definition => definition.name.startsWith('repository.')));

// resolves to a collection of services that definition contains an annotation that satisfies given predicate
reference.multi.annotation(annotation => annotation && annotation.name === 'repository')
// same as
@Inject(Reference.multi.annotation(annotation => annotation && annotation.name === 'repository'));

```

If resolving a service dependency will lead to circular dependency a service won't be created and error will be thrown with details about the path that led to circular dependency.