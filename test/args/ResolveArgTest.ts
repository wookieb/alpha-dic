import {ResolveArg} from "@src/args/ResolveArg";
import {Definition} from "@src/Definition";
import {Container, ContainerArg, create} from "@src/index";
import * as is from 'predicates';

describe('ResolveArg', () => {
    const DEFINITION_1 = Definition.create()
        .useValue(1);

    const DEFINITION_2 = Definition.create()
        .useValue(2);

    const ARGUMENT_FOO = new class extends ContainerArg<string> {
        async getArgument(container: Container): Promise<string> {
            return 'foo';
        }

        getDependentServices(container: Container): Definition | Definition[] {
            return [];
        }
    };

    const ARGUMENT_BAR = new class extends ContainerArg<string> {
        getArgument(container: Container): Promise<string> {
            return Promise.resolve('bar');
        }

        getDependentServices(container: Container): Definition | Definition[] {
            return [];
        }
    };

    const ARGUMENT_FOO_WITH_DEPS = new class extends ContainerArg<string> {
        getArgument(container: Container): Promise<string> {
            return Promise.resolve('foo');
        }

        getDependentServices(container: Container): Definition | Definition[] {
            return [DEFINITION_1, DEFINITION_2];
        }
    }

    class DoNotTouchMe {
        constructor() {
            Object.defineProperty(this, 'foo', {
                get(): any {
                    throw new Error('Do not touch me')
                },
                enumerable: true
            });
        }

        static INSTANCE = new DoNotTouchMe();
    }

    describe('resolves provided ContainerArg in struct', () => {
        it.each<[string, any, any, Definition[]]>([
            [
                'simple object with no ContainerArgs',
                {
                    foo: 'bar',
                    arr: ['foo', 'bar']
                },
                {
                    foo: 'bar',
                    arr: ['foo', 'bar']
                },
                []
            ],
            [
                'simple object with few container args',
                {
                    foo: ARGUMENT_FOO,
                    bar: 'bar'
                },
                {foo: 'foo', bar: 'bar'},
                []
            ],
            [
                'object with nested properties',
                {
                    foo: ARGUMENT_FOO,
                    nested: {
                        bar: ARGUMENT_BAR
                    },
                    arrOf: [
                        ARGUMENT_FOO,
                        ARGUMENT_BAR
                    ],
                    deps: [
                        ARGUMENT_FOO_WITH_DEPS
                    ],
                    simpleValue: 'simpleValue',
                    undef: undefined,
                    num: 10
                },
                {
                    foo: 'foo',
                    nested: {
                        bar: 'bar'
                    },
                    deps: ['foo'],
                    arrOf: ['foo', 'bar'],
                    simpleValue: 'simpleValue',
                    undef: undefined,
                    num: 10
                },
                [DEFINITION_1, DEFINITION_2]
            ],
            [
                'omits non plain objects',
                {
                    foo: DoNotTouchMe.INSTANCE
                },
                {foo: DoNotTouchMe.INSTANCE},
                []
            ],
            [
                'ignores primitive: string',
                'foo',
                'foo',
                []
            ],
            [
                'ignores primitive: undefined',
                undefined,
                undefined,
                []
            ],
            [
                'ignores primitive: null',
                // tslint:disable-next-line:no-null-keyword
                null,
                // tslint:disable-next-line:no-null-keyword
                null,
                []
            ],
            [
                'ignores primitive: number',
                10,
                10,
                []
            ]
        ])('case %s', async (_, value, expected, dependencies) => {
            const arg = new ResolveArg(value);
            const funcArg = new ResolveArg(() => value);

            const container = create();
            await expect(arg.getArgument(container))
                .resolves
                .toEqual(expected);

            await expect(funcArg.getArgument(container))
                .resolves
                .toEqual(expected);

            expect(arg.getDependentServices(container))
                .toEqual(dependencies);

            expect(funcArg.getDependentServices(container))
                .toEqual(dependencies)
        });
    });
});