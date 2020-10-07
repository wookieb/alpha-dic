import {Container} from '../Container';
import {Definition} from '../Definition';

export abstract class ContainerArg<T = any> {
    /**
     * Returns argument value
     */
    abstract getArgument(container: Container): Promise<T>;

    /**
     * Returns a definition or list of definitions of services that giver argument requires
     */
    abstract getDependentServices(container: Container): Definition | Definition[];

    static is(value: any): value is ContainerArg {
        return value instanceof ContainerArg;
    }
}