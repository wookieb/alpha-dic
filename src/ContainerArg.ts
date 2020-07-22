import {Container} from './Container';
import {Definition} from './Definition';

export class ContainerArg {
    /**
     * Returns argument value
     */
    getArgument(container: Container): Promise<any> {
        return Promise.reject(new Error('Not implemented'));
    }

    /**
     * Returns a definition or list of definitions of services that giver argument requires
     */
    getDependentServices(container: Container): Definition | Definition[] {
        throw new Error('Not implemented');
    }

    static is(value: any): value is ContainerArg {
        return value instanceof ContainerArg;
    }
}