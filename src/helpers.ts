export function isStringOrSymbol<T = string | Symbol>(value: any): value is T {
    return typeof value === 'string' || typeof value === 'symbol';
}
