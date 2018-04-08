import {IncomingMessage} from "http";
import {Container, Service} from "../src";
import {names} from "./container";
import {OnActivation} from "../src/decorators/OnActivation";


@Service(names.router)
@OnActivation(async function (router: Router) {
    const container: Container = this;
    const controllersDefinitions = container.findByAnnotation(a => a && a.annotation === 'controller');

    console.log('Looking for registered controllers...');
    for (const controllerDefinition of controllersDefinitions) {
        const controller = await container.get(controllerDefinition);
        const annotation = controllerDefinition.annotations.find(a => a && a.annotation === 'controller');

        router.registerController(annotation.path, controller);
    }
    return router;
})
export class Router {

    registerController(path: string, controller: any) {
        console.log('Registered controller: ', Object.getPrototypeOf(controller).constructor.name, 'for path', path);
    }

    listener(request: IncomingMessage) {

    }
}