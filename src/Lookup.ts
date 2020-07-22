import {AnnotationPredicate, DefinitionPredicate} from './types';
import {Container} from './Container';
import {Definition} from './Definition';
import {TypeRef} from "./TypeRef";
import {ServiceName as _ServiceName} from './types';

export abstract class Lookup {
    abstract find(container: Container): Definition | Definition[];

    abstract toString(): string;
}

export namespace Lookup {
    export class ByServiceName extends Lookup {
        constructor(readonly name: _ServiceName) {
            super();
            Object.freeze(this);
        }

        find(container: Container): Definition | Definition[] {
            const result = container.findByName(this.name);
            return result ? result : [];
        }

        toString() {
            return 'by service name: ' + this.name.toString();
        }
    }

    export class ByAnnotation extends Lookup {
        constructor(readonly predicate: AnnotationPredicate) {
            super();
            Object.freeze(this);
        }

        find(container: Container) {
            return container.findByAnnotation(this.predicate);
        }

        toString() {
            return 'by annotation predicate';
        }
    }

    export class ByPredicate extends Lookup {
        constructor(readonly predicate: DefinitionPredicate) {
            super();
            Object.freeze(this);
        }

        find(container: Container) {
            return container.findByPredicate(this.predicate);
        }

        toString() {
            return 'by service predicate';
        }
    }

    export class ByType extends Lookup {
        constructor(readonly type: TypeRef) {
            super();
            Object.freeze(this);
        }

        find(container: Container) {
            return container.findByPredicate(this.type.predicate);
        }

        toString() {
            return 'by type: ' + this.type.toString();
        }
    }
}