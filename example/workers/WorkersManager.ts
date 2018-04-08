import {Container, Inject, Service} from "../../src";
import {OnActivation} from "../../src/decorators/OnActivation";
import {Queue} from "../Queue";
import {names} from "../container";

@Service()
@OnActivation(async function (service: WorkersManager) {
    // once service gets created we can find all workers and register them automatically
    console.log('Looking for registered workers');
    const container: Container = this;
    const workers = await container.getByAnnotation(a => a === 'worker');
    for (const worker of workers) {
        service.registerWorker(worker)
    }
    return service;
})
export class WorkersManager {

    constructor(@Inject(names.queue) queue: Queue) {
        console.log('Queue injected to WorkersManager', queue);
    }

    registerWorker(worker: any) {
        console.log('Worker registered:', Object.getPrototypeOf(worker).constructor.name);
    }

    start() {
        console.log('Starting workers!');
    }
}