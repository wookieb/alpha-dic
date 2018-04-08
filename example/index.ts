import {createStandard} from "../src";
import {WorkersManager} from "./workers/WorkersManager";
import {defineServices, names} from "./container";
import {createServer} from 'http';
import {Router} from "./Router";

// create standard container with all middlewares preconfigured for you
const container = createStandard({
    config: {
        queue: {
            url: 'amqp://rabbit/vhost',
            backoffStrategy: 'fibonacci',
            initialDelay: 100
        },
        env: process.env // simple way to use ENV variables as config values in container
    }
});

// call a function that is responsible for defining all services
defineServices(container);

// here is the place for our main app
(async () => {

    // let's start workers first! All the workers registration is handled by container
    // you can be sure that all dependencies for WorkersManager have been properly initialized and ready to use
    const workersManager = await container.get<WorkersManager>('WorkersManager');
    await workersManager.start();

    const router = await container.get<Router>(names.router);
    createServer(router.listener.bind(router))
        .listen(5000, () => {
            console.log('Server is running!');
            console.log('Thank you for running alpha-dic example');

            console.log('Process will be closed within 5 seconds...');

            setTimeout(() => {
                process.exit(0);
            }, 5000);
        });
})();