import {ContainerArg} from "@src/args/ContainerArg";
import {Definition} from "@src/Definition";
import {Container} from "@src/Container";
import * as sinon from 'sinon';
import {TransformArg} from "@src/args/TransformArg";
import {create} from "@src/index";

describe('TransformArg', () => {
    const VALUE = 'foo';
    const DEFINITION_1 = Definition.create()
        .useValue('val');

    const ARG_WITH_DEPS = new class extends ContainerArg<string> {
        getArgument(container: Container): Promise<any> {
            return Promise.resolve(VALUE);
        }

        getDependentServices(container: Container): Definition | Definition[] {
            return [DEFINITION_1]
        }
    };

    const ARG_SIMPLE = new class extends ContainerArg<string> {
        getArgument(container: Container): Promise<string> {
            return Promise.resolve(VALUE);
        }

        getDependentServices(container: Container): Definition | Definition[] {
            return [];
        }
    }

    it('applies transform function on arg result', async () => {
        const stub = sinon.stub().returnsArg(0);
        const container = create();

        const arg = new TransformArg(stub, ARG_SIMPLE);

        expect(arg.getDependentServices(container))
            .toEqual([]);

        await expect(arg.getArgument(container))
            .resolves
            .toEqual(VALUE);

        sinon.assert.calledWithExactly(stub, VALUE);
    });

    it('returns the same deps as arg', () => {
        const stub = sinon.stub().returnsArg(0);
        const container = create();

        const arg = new TransformArg(stub, ARG_WITH_DEPS);

        expect(arg.getDependentServices(container))
            .toEqual([DEFINITION_1]);
    });
});