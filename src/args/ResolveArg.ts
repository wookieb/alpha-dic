import {ContainerArg} from "./ContainerArg";
import {Container} from "../Container";
import {Definition} from "../Definition";
import * as is from 'predicates';

const isOmitableType = is.any(is.primitive, is.func);
/**
 * Resolves all ContainerArg in provided value
 */
export class ResolveArg<T extends object> extends ContainerArg<ResolveArg.Resolved<T>> {
    constructor(private readonly value: T | (() => T)) {
        super();
        Object.freeze(this);
    }

    getArgument(container: Container) {
        return this.transformObject(this.getValue(), container);
    }

    private getValue(): T {
        return is.func(this.value) ? this.value() : this.value;
    }

    private async transformObject<T>(result: T, container: Container): Promise<ResolveArg.Resolved<T>> {
        if (isOmitableType(result)) {
            return result as ResolveArg.Resolved<T>;
        }

        if (ContainerArg.is(result)) {
            return result.getArgument(container);
        }

        if (is.arr(result)) {
            return Promise.all(
                result.map(x => isOmitableType(x) ? x : this.transformObject(x, container))
            ) as ResolveArg.Resolved<T>;
        }

        if (is.plainObject(result)) {
            const newObject: any = {};
            for (const [key, value] of Object.entries(result)) {
                newObject[key] = isOmitableType(value) ? value : await this.transformObject(value, container);
            }
            return newObject;
        }

        return result;
    }

    private reducer = (acc: ContainerArg[], current: any) => {
        const args = this.collectContainerArgsFromResult(current);
        if (args) {
            return acc.concat(args);
        }
        return acc;
    };

    private collectContainerArgsFromResult(result: T): ContainerArg[] | undefined {
        if (ContainerArg.is(result)) {
            return [result];
        }

        if (is.primitive(result)) {
            return;
        }

        if (is.array(result)) {
            return result.reduce(this.reducer, []);
        }

        if (is.plainObject(result)) {
            return Object.values(result)
                .reduce(this.reducer, []);
        }
    }

    getDependentServices(container: Container): Definition | Definition[] {
        const value = this.getValue();
        const args = this.collectContainerArgsFromResult(value);
        if (args) {
            return args.reduce<Definition[]>((acc, current) => {
                const deps = current.getDependentServices(container);
                return acc.concat(
                    Array.isArray(deps) ? deps : [deps]
                );
            }, []);
        }
        return [];
    }
}

export namespace ResolveArg {
    export type Resolved<T> = T extends ContainerArg<infer U> ? U :
        (
            T extends Array<infer B> ? Array<Resolved<B>> : (
                T extends object ? {
                    [P in keyof T]: Resolved<T[P]>
                } : T
                )
            );
}