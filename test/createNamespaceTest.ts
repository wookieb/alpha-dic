import {createNamespace, namespaceEntry as r} from "@src/createNamespace";

describe('createNamespace', () => {
    // tslint:disable-next-line:no-empty
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
        someFunc: func as any,
        undef: undefined as any,
        set: set as any
    });

    it('value as string', () => {
        expect(namespace.workers.sendEmail).toStrictEqual('workers.send-email');
        expect(namespace.workerManager).toStrictEqual('worker-manager');
        expect(namespace.deep.helper.b).toStrictEqual('deep.helper.helperB');
    });

    it('entry symbol gets resolved to path', () => {
        expect(namespace.workers.jobQueue).toStrictEqual('workers.jobQueue');
        expect(namespace.managers.users).toStrictEqual('managers.users');
        expect(namespace.deep.helper.a).toStrictEqual('deep.helper.a');
    });

    it('throws na error if key does not exist', () => {
        expect(() => {
            // tslint:disable-next-line:no-unused-expression
            (namespace.workers as any).someKey;
        })
            .toThrow('There is no name for path: workers.someKey');
    });

    it('return original value if it is not an object, string or symbol', () => {
        expect(namespace.someFunc).toStrictEqual(func);
        expect(namespace.undef).toBeUndefined();
        expect(namespace.set).toStrictEqual(set);
    });
});