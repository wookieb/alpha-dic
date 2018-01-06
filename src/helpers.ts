import * as is from 'predicates';

export function isStringOrSymbol(value: any): value is (string | symbol) {
    return is.string(value) || is.symbol(value);
}