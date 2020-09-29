import d = require('debug');

export function debug(suffix?: string) {
    return d('alpha-dic' + (suffix ? `:${suffix}` : ''));
}