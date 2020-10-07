import * as is from 'predicates';

export interface NamespaceObject {[key: string]: NamespaceObject | string | Symbol}

export function createNamespace<T extends NamespaceObject>(object: T): T {
    return createProxyForPrefix([], object);
}

export const namespaceEntry = Symbol('namespaceEntry');

function createProxyForPrefix<T extends NamespaceObject>(prefixParts: string[], object: T): T {
    return new Proxy(object, {
        get(target: T, key: string) {
            if (!(key in target)) {
                throw new Error(`There is no name for path: ${getKey(prefixParts, key)}`);
            }

            const value = target[key];
            if (is.plainObject(value)) {
                return createProxyForPrefix(prefixParts.concat([key]), value as NamespaceObject);
            }

            if (is.string(value)) {
                return getKey(prefixParts, value);
            }

            //tslint:disable-next-line: strict-comparisons
            if (value === namespaceEntry) {
                return getKey(prefixParts, key);
            }
            return value;
        }
    });
}

function getKey(prefixParts: string[], lastPart: string) {
    return prefixParts.concat([lastPart]).join('.');
}