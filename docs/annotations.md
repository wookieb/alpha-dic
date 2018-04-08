# Annotations
Annotation is a value added to service definition. There is no limit or any restriction for registered annotations.
You can use them for metadata, aggregation, extra configuration for middlewares and more.
Also _alpha-dic_ allows you to retrieve definitions or services based on the annotations (see (defining services)[./defining-services.md] for more info).

Few usage examples below.
```javascript
import {Reference} from 'alpha-dic';

// every service with that annotation will be treated as validation service
const validation = {name: 'validation'};

class Validator {
    constructor(validations) {
        assert.ok(validations[0] instanceof EmailValidator);
        assert.ok(validations[1] instanceof UserUniquenessValidator);
        assert.ok(validations[2] instanceof UserValidator);
    }
}

// adding annotation via decorator
@Annotation(validation)
@Service()
class UserValidator {
    
}

// or manually
container.definitionWithConstructor('validator', Validator)
    .withArgs(
        // inject all services that have "validation" annotation
        Reference.multi.annotation(annotation => annotation === validation)
    );
   
container.definitionWithConstructor('emailValidator', EmailValidator)
    .annotate(validation);

container.definitionWithConstructor('userUniquenessValidator', UserUniquenessValidator)
    .annotate(validation);

container.get('validator')
    .then((validator) => {
        /* */
    });
```