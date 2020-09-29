import {AnnotationPredicate, ServiceName, DefinitionPredicate} from './types';
import {Container} from './Container';
import {Definition} from './Definition';
import * as errors from './errors';
import {Lookup} from './Lookup';
import {ContainerArg} from './ContainerArg';
import {TypeRef} from './TypeRef';

export class Reference extends ContainerArg {
    static one = {
        name(name: ServiceName) {
            return new Reference('one', new Lookup.ByServiceName(name));
        },
        predicate(predicate: DefinitionPredicate) {
            return new Reference('one', new Lookup.ByPredicate(predicate));
        },
        annotation(predicate: AnnotationPredicate) {
            return new Reference('one', new Lookup.ByAnnotation(predicate));
        },
        type(type: TypeRef) {
            return new Reference('one', new Lookup.ByType(type));
        }
    };

    static multi = {
        predicate(predicate: DefinitionPredicate) {
            return new Reference('multi', new Lookup.ByPredicate(predicate));
        },
        annotation(predicate: AnnotationPredicate) {
            return new Reference('multi', new Lookup.ByAnnotation(predicate));
        },
        type(type: TypeRef) {
            return new Reference('multi', new Lookup.ByType(type));
        }
    };

    constructor(private readonly type: 'one' | 'multi', private readonly lookup: Lookup) {
        super();
        Object.freeze(this);
    }

    getArgument(container: Container): Promise<any> {
        const definitions = this.findDefinitions(container);
        if (Array.isArray(definitions)) {
            return Promise.all(this.findMulti(container).map(
                d => container.get(d)
            ));
        } else {
            return container.get(definitions);
        }
    }

    getDependentServices(container: Container) {
        return this.findDefinitions(container);
    }

    private findDefinitions(container: Container): Definition | Definition[] {
        if (this.type === 'one') {
            return this.findOne(container);
        }

        return this.findMulti(container);
    }

    private findOne(container: Container): Definition {
        const definitions = this.lookup.find(container);
        if (Array.isArray(definitions)) {
            if (definitions.length === 0) {
                throw errors.NO_MATCHING_SERVICE('No matching service for following lookup: ' + this.lookup);
            }

            if (definitions.length > 1) {
                const servicesNames = definitions.map(s => s.name).join(', ');
                throw errors.AMBIGUOUS_SERVICE(`Multiple services found (${servicesNames}) with following lookup: ${this.lookup}`);
            }
            return definitions[0];
        } else {
            return definitions;
        }
    }

    private findMulti(container: Container): Definition[] {
        return <Definition[]>this.lookup.find(container);
    }
}

