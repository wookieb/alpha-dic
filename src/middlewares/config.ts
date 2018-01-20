import {Definition} from "../Definition";
import * as is from 'predicates';
import {ConfigRequest} from "../ConfigRequest";
import {ConfigProvider} from "../ConfigProvider";

const isConfigRequest = is.instanceOf(ConfigRequest);

const assertConfigProvider = is.assert(is.func, 'Invalid config provider - must be a function');

export function configMiddleware(configProvider: ConfigProvider) {
    assertConfigProvider(configProvider);

    return function configMiddlewareExecutor(definition: Definition, next: Function) {
        const hasAnyConfigRequest = definition.args.some(isConfigRequest);
        if (hasAnyConfigRequest) {
            return next(definition.modify({
                args: definition.args.map(arg => {
                    return isConfigRequest(arg) ? configProvider(<ConfigRequest>arg) : arg;
                })
            }));
        }
        return next(definition);
    }
}