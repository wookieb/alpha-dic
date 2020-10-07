import deb = require('debug');

export function debugFn(suffix?: string): deb.Debugger {
    return deb('alpha-dic' + (suffix ? `:${suffix}` : ''));
}