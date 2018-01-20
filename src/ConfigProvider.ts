import * as objectPath from 'object-path';
import * as errors from './errors';
import {ConfigRequest} from "./ConfigRequest";

export function configProviderForObject(config: object): ConfigProvider {
    return (request: ConfigRequest) => {
        const result = objectPath.get(config, request.path);

        if (result === undefined) {
            if (request.hasDefaultValue) {
                return request.defaultValue;
            } else {
                throw new errors.MISSING_CONFIG_VALUE(`Config at path "${request.path}" is not defined and default value is not provided`);
            }
        }
        return result;
    };
}

/**
 * Returns config value at given request path.
 *
 * Throws an error if default value is not defined and value at given path does not exist
 *
 * If value is not defined returns default value from request
 */
export type ConfigProvider = (request: ConfigRequest) => any;