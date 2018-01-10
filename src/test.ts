import {Container} from "./Container";
import {reference} from "./referenceFunc";
import {activationMiddleware, onActivation} from "./middlewares/activation";

const container = new Container();
container.addMiddleware(activationMiddleware);

container.definitionWithValue('a', {})
    .annotate(onActivation(async function (service: any) {
        console.log('deps');
        const deps = await this.getByAnnotation((a: any) => a === 'test');

        console.log('found deps', deps);
        service.deps = deps;
        return service;
    }));

container.definitionWithValue('b', function (a: any) {
    console.log('a', 'b');
    return {
        a
    }
})
    .withArgs(reference('a'))
    .annotate('test');

container.get('a')
    .then((a: any) => console.log(a))
    .catch(e => console.log(e));

