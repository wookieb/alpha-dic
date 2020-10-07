import * as is from 'predicates';
import {ContainerArg} from "./ContainerArg";
import {Container} from "../Container";
import {getConfigProviderForContainer} from "../middlewares/config";

const assertNotBlank = is.assert(is.notBlank, 'Config "path" cannot be blank');

export class ConfigRequestArg<T> extends ContainerArg<T> {
    public readonly hasDefaultValue: boolean;

    constructor(public readonly path: string, public readonly defaultValue?: any) {
        super();
        assertNotBlank(this.path);
        this.hasDefaultValue = arguments.length > 1;
        Object.freeze(this);
    }

    static create<T = any>(path: string, defaultValue?: T): ConfigRequestArg<T>;
    static create<T = any>(...args: [string, undefined | T]): ConfigRequestArg<T> {
        return new ConfigRequestArg<T>(...args);
    }

    async getArgument(container: Container): Promise<T> {
        return getConfigProviderForContainer(container)(this);
    }

    getDependentServices(container: Container) {
        return [];
    }
}