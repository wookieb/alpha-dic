import { ContainerArg } from "./ContainerArg";
import { Container } from "../Container";

/**
 * Applies transformer function on result of provided argument
 */
export class TransformArg<T, TResult> extends ContainerArg<TResult> {
	constructor(
		private readonly transformer: (value: T) => TResult,
		private readonly arg: ContainerArg<T>
	) {
		super();
		Object.freeze(this);
	}

	async getArgument(container: Container): Promise<TResult> {
		return this.transformer(await this.arg.getArgument(container));
	}

	getDependentServices(container: Container) {
		return this.arg.getDependentServices(container);
	}
}
