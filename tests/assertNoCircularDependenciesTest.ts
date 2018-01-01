import {Container} from "../src/Container";
import {Reference} from "../src/Reference";
import {assert} from 'chai';
import {assertNoCircularDependencies} from "../src/assertNoCircularDependencies";
import * as errors from '../src/errors';

let container: Container;

function assertCircularDependencyFound(serviceName: string, dependenciesPath: string[]) {
    try {
        assertNoCircularDependencies(container, container.findByName(serviceName));
        assert.fail('Circular dependency error expected');
    } catch (e) {
        assert.propertyVal(e, 'code', errors.CIRCULAR_DEPENDENCY_DETECTED.code);
        const foundDependenciesPath = e.message.substr(e.message.indexOf('found: ') + 6)
            .split(' -> ')
            .map((s: string) => s.trim());

        assert.sameMembers(foundDependenciesPath, dependenciesPath);
    }
}

describe('assertNoCircularDependencies', () => {

    beforeEach(() => {
        container = new Container()
    });

    it('simple circular dependency', () => {
        container.definition('A')
            .withArgs(Reference.one.name('B'));

        container.definition('B')
            .withArgs(Reference.one.name('A'));


        assertCircularDependencyFound('A', ['A', 'B', 'A']);
    });

    it('simple circular dependency for services with regular arguments', () => {
        container.definition('A')
            .withArgs('foo', 'bar', Reference.one.name('B'), 'foo1');

        container.definition('B')
            .withArgs(Reference.one.name('A'), 'bar');
        assertCircularDependencyFound('A', ['A', 'B', 'A']);
    });

    describe('2 level circular dependency', () => {
        it('simple', () => {
            container.definition('A')
                .withArgs(Reference.one.name('B'));

            container.definition('B')
                .withArgs(Reference.one.name('C'));

            container.definition('C')
                .withArgs(Reference.one.name('A'));

            assertCircularDependencyFound('A', ['A', 'B', 'C', 'A']);
        });

        it('dependency of dependency', () => {
            container.definition('A')
                .withArgs(Reference.one.name('B'));

            container.definition('B')
                .withArgs(Reference.one.name('C'));

            container.definition('C')
                .withArgs(Reference.one.name('B'));

            assertCircularDependencyFound('A', ['A', 'B', 'C', 'B']);
        });

        it('with multi services arg', () => {
            container.definition('A')
                .withArgs(Reference.one.name('B'));

            container.definition('B')
                .withArgs(Reference.one.name('C'));

            container.definition('C')
                .withArgs(Reference.multi.predicate(
                    d => d.name === 'A' || d.name === 'B'
                ));

            assertCircularDependencyFound('A', ['A', 'B', 'C', 'A']);
        });
    });

    it('3 levels circular dependency', () => {
        container.definition('A')
            .withArgs(Reference.one.name('B'));

        container.definition('B')
            .withArgs(Reference.one.name('C'));

        container.definition('C')
            .withArgs(Reference.one.name('D'));

        container.definition('D')
            .withArgs(Reference.one.name('A'));

        assertCircularDependencyFound('A', ['A', 'B', 'C', 'D', 'A']);
    });


});