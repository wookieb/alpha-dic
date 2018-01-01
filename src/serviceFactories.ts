import {ServiceFactory} from "./types";

export function fromConstructor(constructor: Function): ServiceFactory {
    return function (...args: any[]) {
        return new (Function.prototype.bind.apply(constructor, [null].concat(args)));
    }
}

export function fromFactory(factory: (...args: any[]) => any): ServiceFactory {
    return factory;
}

export function fromValue(value: any): ServiceFactory {
    return function () {
        return value;
    }
}