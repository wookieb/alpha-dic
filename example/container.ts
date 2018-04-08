import {config, Container, preloadServiceModules} from "../src";
import {createNamespace, namespaceEntry as r} from "../src/createNamespace";
import {Queue} from "./Queue";


// Once your application grow then having one object with names for services might be super useful and less error-prone
// names.repository.users returns "names.repository.users"
// names.queue returns "names.queue" and so on
export const names = createNamespace({
    repository: {
        users: r,
        recipients: r
    },
    queue: r,
    router: r
});

export function defineServices(container: Container) {

    // We need to load all modules with @Service decoration
    preloadServiceModules(container, [
        './workers/*.js',
        './repositories/*.js',
        './controllers/*.js',
        './router.js'
    ]);


    // example of manual service definition
    // service is created in an asynchronous way by awaiting for connection to be established
    container.definitionWithFactory(names.queue, async (url: string, backoffStrategy: string, initialDelay: number) => {
        const queue = new Queue();
        queue.applyBackoffStrategy(backoffStrategy, {initialDelay});

        console.log('Connecting to queue...', url);
        await queue.connect(url);
        console.log('Connected to queue!');

        return queue;
    })
        .withArgs(
            // manually injected config
            config('queue.url'),
            config('queue.backoffStrategy'),
            config('queue.initialDelay')
        )
}

export function controller(path: string) {
    return {annotation: 'controller', path};
}