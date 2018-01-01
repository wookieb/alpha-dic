import {ContainerArg} from "../src/ContainerArg";
import {assert} from 'chai';
import {Container} from "../src/Container";

describe('ContainerArg', () => {

    const container = new Container();
    const arg = new ContainerArg();

    it('getDependentServices is not implemented', () => {
        assert.throws(() => {
            arg.getDependentServices(container);
        }, /Not implemented/);
    });

    it('getArgument rejects with an error', () => {
        return assert.isRejected(arg.getArgument(container), /Not implemented/);
    });
});