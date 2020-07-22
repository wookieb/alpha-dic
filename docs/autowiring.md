# Autowiring

Autowiring is an ability to automatically infer services to inject without explicitly referencing them which dramatically improves development speed.

## Usage

In order to make autowiring work, your project needs to use Typescript with following options enabled.
```json
{
  "compiledOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Only services defined through @AutowiredService decorator got autowired
```typescript
import {Service, AutowiredService} from 'alpha-dic';
import * as assert from 'assert';

@Service()
class Foo {
    
}

// you need to use @AutowiredService instead @Service 
@AutowiredService()
class Bar {
    constructor(private foo: Foo) {
        assert.ok(this.foo instanceof Foo);
    }
}
```

## Limitations

### Interfaces and union types are not supported

Due to typescript limitation _alpha-dic_ is not able to determine which service implements given interface or applies to union type
```typescript

interface Foo {
    
}

// ❌ - This will fail
@AutowiredService()
class Bar {
    constructor(private foo: Foo) {
    
    }
}
```

To solve this you need to define injection explicitly
```typescript
interface Foo {}

// ✅
@AutowiredService()
class Bar {
    constructor(@Inject('Foo') private foo: Foo) {
    
    }
}
```


### Type of services created via factory cannot be inferred

The following service will not be available for autowiring since definition type cannot be inferred.
```typescript
class Foo {}
// ❌ 
container.definitionWithFactory(() => {
    return new Foo();
})
```

In order to fix it you need to define definition type explicitly

```typescript
// ✅
class Foo {}
container.definitionWithFactory(() => {
    return new Foo();
}, Foo);
```

### Only services defined via @AutowiredService are autowired

```typescript
class Bar {}
class Foo {
    constructor(private bar: Bar) {}
}

// ❌ - no autowiring support 
container.definitionWithConstructor(Foo)
```