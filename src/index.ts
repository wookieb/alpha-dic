import * as errors from './errors';
import {Container} from './Container';

export * from './Definition';
export * from './Container';

export * from './args/ReferenceArg';
export * from './args/ContainerArg';
export * from './args/ConfigRequestArg';
export * from './args/ResolveArg';
export * from './args/TransformArg';

export * from './types';
export * from './reference';
export * from './config';
export * from './Lookup';
export * from './createAnnotationFactory';
export * from './preloadServiceModules';
export * from './loadServices';

export * from './middlewares/activation';
export * from './middlewares/config';
export * from './middlewares/deprecated';

export * from './decorators/OnActivation';
export * from './decorators/AutowiredService';
export * from './decorators/Config';
export * from './decorators/Annotation';
export * from './decorators/Inject';
export * from './decorators/Deprecated';
export * from './createStandard';

export {Service, getDefinitionForClass} from './decorators/Service';

export {createNamespace, namespaceEntry} from './createNamespace';

export {errors};

export function create(parent?: Container) {
    return new Container(parent);
}

export const createContainer = create;