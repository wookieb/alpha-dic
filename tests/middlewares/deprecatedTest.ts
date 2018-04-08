import {Definition, deprecated, deprecatedMiddleware, deprecatedAnnotationName} from '../../src';
import {assert} from 'chai';
import * as sinon from 'sinon';

describe('deprecated', () => {
    const NOTE = 'Some note';
    const NOTE2 = 'Extra note';

    it('annotation', () => {
        const annotation = deprecated(NOTE);

        assert.deepEqual(annotation, {
            name: deprecatedAnnotationName,
            note: NOTE
        })
    });

    describe('middleware', () => {
        let definition: Definition;
        let next: sinon.SinonSpy;

        beforeEach(() => {
            definition = new Definition('someServiceName');
            definition.useValue('some value');

            next = sinon.spy();
        });

        it('single deprecation note', () => {
            definition.annotate(deprecated(NOTE));

            const messageFunc = sinon.spy();
            deprecatedMiddleware(messageFunc)(definition, next);

            sinon.assert.calledWith(messageFunc, `Service ${definition.name} is deprecated: ${NOTE}`);
        });

        it('multiple deprecation notes', () => {
            definition.annotate(deprecated(NOTE));
            definition.annotate(deprecated(NOTE2));

            const messageFunc = sinon.spy();
            deprecatedMiddleware(messageFunc)(definition, next);

            sinon.assert.calledWith(messageFunc, `Service ${definition.name} is deprecated: ${NOTE}, ${NOTE2}`);
        });

        it('no deprecation annotations', () => {
            const messageFunc = sinon.spy();
            deprecatedMiddleware(messageFunc)(definition, next);

            sinon.assert.notCalled(messageFunc);
        });
    })
});