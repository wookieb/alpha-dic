import {AssertionError, assert} from 'chai';
import {DomainErrorDescriptor} from "alpha-errors";

export function assertThrowsErrorWithCode<T extends Function>(func: T, errorDescriptor: DomainErrorDescriptor) {
    try {
        func();
        throw new AssertionError('Expected error to be thrown');
    } catch (e) {
        assertErrorFromErrorDescriptor(e, errorDescriptor);
    }
}

export function assertErrorFromErrorDescriptor(error: any, errorDescriptor: DomainErrorDescriptor) {
    assert.instanceOf(error, errorDescriptor.errorClass, 'Invalid error class thrown');
    assert.propertyVal(error, 'code', errorDescriptor.code, 'Invalid error code');
}