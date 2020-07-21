import {createNamespace, namespaceEntry as r} from "../src/createNamespace";
import {assert} from 'chai';

describe('createNamespace', () => {
    const func = function () {
    };
    const set = new Set([1, 2]);
    const namespace = createNamespace({
        workers: {
            sendEmail: 'send-email',
            jobQueue: r
        },
        workerManager: 'worker-manager',
        managers: {
            users: r,
            recipients: 'recipients'
        },
        deep: {
            helper: {
                a: r,
                b: 'helperB'
            }
        },
        someFunc: <any>func,
        undef: undefined,
        set: <any>set
    });

    it('value as string', () => {
        assert.strictEqual(namespace.workers.sendEmail, 'workers.send-email');
        assert.strictEqual(namespace.workerManager, 'worker-manager');
        assert.strictEqual(namespace.deep.helper.b, 'deep.helper.helperB');
    });

    it('entry symbol gets resolved to path', () => {
        assert.strictEqual(<string><any>namespace.workers.jobQueue, 'workers.jobQueue');
        assert.strictEqual(<string><any>namespace.managers.users, 'managers.users');
        assert.strictEqual(<string><any>namespace.deep.helper.a, 'deep.helper.a');
    });

    it('throws na error if key does not exist', () => {
        assert.throws(() => {
            (<any>namespace).workers.someKey
        }, Error, 'There is no name for path: workers.someKey');
    });

    it('return original value if it is not an object, string or symbol', () => {
        assert.strictEqual(namespace.someFunc, func);
        assert.strictEqual(namespace.undef, undefined);
        assert.strictEqual(namespace.set, set);
    });
});