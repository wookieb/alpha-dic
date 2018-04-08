# Decorators
Creating service definition via container (`definitionWithConstructor` etc) might be a tedious and error-prone work.
That's why _alpha-dic_ supports decorators for classes.

NOTE! Hopefully this is obvious but Decorators are not supported by node.js natively. You need to use Typescript (highly recommended) or other transpiler (like Babel) to make it work.

```typescript
const {Service, Annotation, Inject} = require('alpha-dic');

@Service() // you can also provide a name @Service('name'). By default class/function name inferred.
@Annotation({name: 'extraAnnotation'})
export class NotificationCenter {
    
    @Inject('superExtraService')
    public extraService: ExtraService;
    
    constructor(
        @Inject('EmailRenderer') emailRenderer: EmailRenderer, 
        @Inject('EmailSender') emailSender: EmailSender) {
    }
}

```

## Setup

Since decorator is just regular function you need to give it an opportunity to get called. To do soo you can use `preloadServiceModules` function that loads all modules matching given patterns.  
```typescript
import {createStandard, preloadServiceModules} from 'alpha-dic';

const container = createStandard();

// loads all files in given directory so all @Service decorator calls got a chance to register service definitions
preloadServiceModules(container, './services/*'); 
```

## Limitations
You can define only one service definition per class defined via decorators. If you need more you have to create them on container via `definitionWithClass`.