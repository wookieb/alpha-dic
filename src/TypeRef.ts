import * as isPred from "predicates";
import { DefinitionPredicate } from "./types";

const reservedConstructors = new Set<Function>(
	["Function", "Object", "Promise"].map(x => (global as any)[x]).filter(x => x)
);

export class TypeRef {
	constructor(private target: Function) {
		if (!TypeRef.isAllowedTarget(target)) {
			throw new Error(`Target ${target} is not allowed`);
		}
		Object.freeze(this);
	}

	matches(type: TypeRef): boolean {
		//tslint:disable-next-line: strict-comparisons
		return type.target === this.target || type.target.prototype instanceof this.target;
	}

	toString() {
		return `instance of class "${this.target.name}"`;
	}

	get predicate(): DefinitionPredicate {
		return x => x.type !== undefined && this.matches(x.type);
	}

	static isAllowedTarget(target: Function) {
		return !reservedConstructors.has(target);
	}

	static is(value: any): value is TypeRef {
		return value instanceof TypeRef;
	}

	static createFromType(type: Function): TypeRef | undefined {
		if (TypeRef.isAllowedTarget(type)) {
			return new TypeRef(type);
		}
	}

	static createFromValue(value: any) {
		if (isPred.object(value) && value !== null) {
			const proto = Object.getPrototypeOf(value);
			if (TypeRef.isAllowedTarget(proto.constructor)) {
				return new TypeRef(proto.constructor);
			}
		}
	}

	static predicateForType(type: Function): DefinitionPredicate | undefined {
		const ref = TypeRef.createFromType(type);
		if (ref) {
			return ref.predicate;
		}
	}
}
