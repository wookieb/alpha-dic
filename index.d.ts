export class Service {
    constructor(name: string);

    nonCacheable(): Service;

    useConstructor(constructorFunction: Function): Service;

    useClass(classObject: Function): Service;

    useFactory(factoryFunction: Function): Service;

    useValue(value: any): Service;

    useAsyncFactory(asyncFactory: Function): Service;

    dependsOn(dependencies: Array<string>): Service;
    dependsOn(...dependencies: Array<string>): Service;

    annotate(annotation: {name: string}): Service;
    annotate(annotationName: string, properties: Object): Service;

    hasAnnotation(name: string): boolean;

    getAnnotation(name: string): Object;

    getAnnotations(): Object;
}


export class AlphaDIC {
    get(nameOrService: string|Service, callback?: (err: any, instance: any) => void): Promise<any>;
    get(nameOrService: Array<string|Service>, callback?: (err: any, instances: Array<any>) => void): Promise<Array<any>>;

    has(name: string|Service): boolean;

    getByPredicate(predicate: (service: Service) => boolean, callback?: (err: any, instances: Array<any>) => void): Promise<Array<any>>;

    getByAnnotationName(annotationName: string, callback?: (err: any, instances: Array<any>) => void): Promise<Array<any>>

    findByPredicate(predicate: (service: Service) => boolean): Array<Service>;

    findByAnnotation(annotationName: string|((annotationName: string) => boolean), properties?: Object|((annotation: Object) => boolean));

    service(name: string): Service;

    serviceAsConstructor(name: string, constructorFunction: Function, dependencies?: Array<string>): Service;

    serviceAsFactory(name: string, factoryFunction: Function, dependencies?: Array<String>): Service;

    serviceAsValue(name: string, value: any, dependencies?: Array<String>): Service;

    getServicesDefinitions(): Array<Service>

    getServiceDefinition(name: string): Service
}