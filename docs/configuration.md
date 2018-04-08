# Configuration values
You can inject any configuration values, like database credentials, passwords, other secrets directly to services and provide default values for them if not defined

Usage with decorator
```typescript
import {Config} from 'alpha-dic';
@Service()
class Foo {
    constructor(@Config('mongo') private connectionString: string) {
        
    }
}

@Service()
class Bar {
    
    // Uses second argument (default value) if "mongo" config is not defined
    @Config('mongo', 'mongo://localhost/' ) 
    mongoConnectionString: string
}
```

Simple usage without decorators
```typescript
import {config} from 'alpha-dic';

container.definitionWithConstructor('foo', Foo)
    .withArgs(config('mongo'))
```

## Setup
The easiest way is to use `createStandard` function and provide config object as an argument;
```typescript
import {createStandard} from 'alpha-dic';

const container = createStandard({
    config: {
        mongo: 'mongo://foo:bar@example.com/db'
    }
});
```