import {DomainErrorDescriptor} from "alpha-errors";

export function assertThrowsErrorWithCode<T extends Function>(func: T, errorDescriptor: DomainErrorDescriptor) {
    try {
        func();
        throw new Error('Expected error to be thrown');
    } catch (e) {
        assertErrorFromErrorDescriptor(e, errorDescriptor);
    }
}

export function assertErrorFromErrorDescriptor(error: any, errorDescriptor: DomainErrorDescriptor) {
    expect(error)
        .toBeInstanceOf(errorDescriptor.errorClass);
    expect(error.code)
        .toEqual(errorDescriptor.code);
}