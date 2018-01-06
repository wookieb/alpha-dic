import {AnnotationPredicate, ServiceName, DefinitionPredicate} from './types';
import {Container} from './Container';
import {Definition} from './Definition';

export class Lookup {
    constructor(private readonly type: 'name' | 'predicate' | 'annotationName' | 'annotationPredicate',
                private readonly value: ServiceName | DefinitionPredicate | AnnotationPredicate) {
        Object.freeze(this);
    }

    static byServiceName(name: ServiceName) {
        return new Lookup('name', name);
    }

    static byServicePredicate(predicate: DefinitionPredicate) {
        return new Lookup('predicate', predicate);
    }

    static byAnnotation(predicate: AnnotationPredicate) {
        return new Lookup('annotationPredicate', predicate);
    }

    find(container: Container): Definition | Definition[] {
        switch (this.type) {
            case 'name':
                return container.findByName(<ServiceName>this.value);

            case 'predicate':
                return container.findByPredicate(<DefinitionPredicate>this.value);

            case 'annotationPredicate':
                return container.findByAnnotation(<AnnotationPredicate>this.value);
        }
    }

    toString() {
        switch (this.type) {
            case 'name':
                return 'by service name: ' + Object.prototype.toString.call(this.value);

            case 'predicate':
                return 'by service predicate';

            case 'annotationPredicate':
                return 'by annotation predicate';
        }
    }
}