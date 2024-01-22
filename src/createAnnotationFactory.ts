import * as is from "predicates";
import { Annotation } from "./decorators/Annotation";
import { Predicate } from "predicates/types";

export function createAnnotationFactory<T extends (...args: any[]) => any>(
	annotationName: string,
	extraAttributesFactory?: T
): AnnotationFactory<Parameters<T>, { name: string } & ReturnType<T>> {
	const factory: AnnotationFactory<any, any> = ((...args: any[]) => {
		const annotation: any = {};
		if (extraAttributesFactory) {
			const attributes = extraAttributesFactory(...args);
			if (is.object(attributes)) {
				Object.assign(annotation, attributes);
			}
		}
		annotation.name = annotationName;
		return annotation;
	}) as any;
	factory.predicate = is.prop("name", is.equal(annotationName));
	factory.andPredicate = (extraPredicate: Predicate) => {
		return is.all(factory.predicate, extraPredicate);
	};
	factory.decorator = (...args: any[]) => {
		return (clazz: Function) => {
			Annotation(factory(...args))(clazz);
		};
	};
	return factory;
}

export interface AnnotationFactory<TParams extends any[], TAnnotation> {
	(...params: TParams): TAnnotation;

	predicate: (value: any) => boolean;
	andPredicate: (extraPredicate: Predicate) => Predicate;
	decorator: (...params: TParams) => ClassDecorator;
}
