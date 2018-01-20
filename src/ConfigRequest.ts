import * as is from 'predicates';

const assertNotBlank = is.assert(is.notBlank, 'Config "path" cannot be blank');

export class ConfigRequest {
    public readonly hasDefaultValue: boolean;

    constructor(public readonly path: string, public readonly defaultValue?: any) {
        assertNotBlank(this.path);
        this.hasDefaultValue = arguments.length > 1;

        Object.freeze(this);
    }

    static create(path: string, defaultValue?: any) {
        return new (Function.prototype.bind.apply(ConfigRequest, [null, ...arguments]));
    }
}