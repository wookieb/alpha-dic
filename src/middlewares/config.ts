import {Definition} from "../Definition";
import * as is from 'predicates';
import {ConfigProvider} from "../ConfigProvider";
import {Container} from "../Container";
import {Middleware, onMiddlewareAttach} from "../types";
import * as errors from "../errors";

const assertConfigProvider = is.assert(is.func, 'Invalid config provider - must be a function');

export function configMiddleware(configProvider: ConfigProvider): Middleware {
    assertConfigProvider(configProvider);

    const f: Middleware = (definition: Definition, next: Function) => {
        return next(definition);
    };

    f[onMiddlewareAttach] = (container: Container) => {
        attachConfigProviderToContainer(container, configProvider);
    };
    return f;
}

const configMap = new WeakMap<Container, any>();

export function attachConfigProviderToContainer(container: Container, configProvider: ConfigProvider) {
    if (!configMap.has(container)) {
        configMap.set(container, configProvider);
    }
}

export function getConfigProviderForContainer(container: Container): ConfigProvider {
    if (!configMap.has(container)) {
        throw errors.CONFIG_PROVIDER_NOT_ATTACHED();
    }
    return configMap.get(container);
}