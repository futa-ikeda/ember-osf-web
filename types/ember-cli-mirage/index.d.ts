export { default as faker } from 'faker';

type ID = number | string;

interface AnyAttrs {
    [key: string]: any;
}

type Record < T > = T & { id: ID };

export interface DatabaseCollection<T = AnyAttrs> {
    insert<S extends T | T[]>(data: S): S extends T ? Record<T> : Array<Record<T>>;
    find<S extends ID | ID[]>(ids: S): S extends ID ? Record<T> : Array<Record<T>>;
    findBy(query: T): Record<T>;
    where(query: T | ((r: Record<T>) => boolean)): Array<Record<T>>;
    update(attrs: T): Array<Record<T>>;
    update(target: ID | T, attrs: T): Array<Record<T>>;
    remove(target?: ID | T): void;
    firstOrCreate(query: T, attributesForCreate?: T): Record<T>;
}

export interface Database {
    createCollection(name: string): void;
    [collectionName: string]: DatabaseCollection;
}

interface ModelInstanceShared<T> {
    id: ID;
    attrs: T;

    save(): void;
    update<K extends keyof T>(key: K, val: T[K]): void;
    destroy(): void;
    isNew(): boolean;
    isSaved(): boolean;
    reload(): void;
    toString(): string;
}

type ModelInstance < T > = ModelInstanceShared<T> & T;

interface Collection<T> {
    models: Array<ModelInstance<T>>;
    modelName: string;
    update<K extends keyof T>(key: K, val: T[K]): void;
    save(): void;
    reload(): void;
    destroy(): void;
    sort(sortFn: (a: ModelInstance<T>, b: ModelInstance<T>) => number): Collection<T>;
    filter(filterFn: (model: ModelInstance<T>) => boolean): Collection<T>;
}

interface ModelClass<T = AnyAttrs> {
    new(attrs: T): ModelInstance<T>;
    create(attrs: T): ModelInstance<T>;
    all(): Collection<T>;
    find<S extends ID | ID[]>(ids: S): S extends ID ? ModelInstance<T> : Collection<T>;
    findBy(query: T): ModelInstance<T>;
    first(): ModelInstance<T>;
    where(query: T | ((r: ModelInstance<T>) => boolean)): Collection<T>;
}

export interface Schema {
    db: Database;
    [modelName: string]: ModelClass;
}

export interface Request {
    requestBody: any;
    params: {
        [key: string]: string | number,
    };
}

export interface HandlerContext {
    serialize(modelOrCollection: ModelInstance | ModelInstance[] | ModelClass, serializerName?: string): any;
    normalizedRequestAttrs(): any;
}
interface HandlerObject {
    [k: string]: any;
}
interface HandlerOptions {
    timing?: number;
    coalesce?: boolean;
}
type HandlerFunction = (this: HandlerContext, schema: Schema, request: Request) => any;

/* tslint:disable unified-signatures */
function handlerDefinition(path: string, options?: HandlerOptions): void;
function handlerDefinition(
    path: string,
    shorthand: string | string[],
    options?: HandlerOptions,
): void;
function handlerDefinition(
    path: string,
    shorthand: string | string[],
    responseCode: number,
    options?: HandlerOptions,
): void;
function handlerDefinition(
    path: string,
    responseCode?: number,
    options?: HandlerOptions,
): void;
function handlerDefinition(
    path: string,
    handler: HandlerFunction | HandlerObject,
    options?: HandlerOptions,
): void;
function handlerDefinition(
    path: string,
    handler: HandlerFunction | HandlerObject,
    responseCode: number,
    options?: HandlerOptions,
): void;
/* tslint:enable unified-signatures */

export interface Server {
    namespace: string;
    timing: number;
    logging: boolean;
    pretender: any;
    urlPrefix: string;
    apiBaseUrl: string;

    get: typeof handlerDefinition;
    post: typeof handlerDefinition;
    put: typeof handlerDefinition;
    patch: typeof handlerDefinition;
    del: typeof handlerDefinition;

    resource(resourceName: string, options?: { only?: string[], except?: string[], path?: string }): void;

    loadFixtures(...fixtures: string[]): void;

    // TODO when https://github.com/Microsoft/TypeScript/issues/1360
    // passthrough(...paths: string[], verbs?: Verb[]): void;
    passthrough(...args: any[]): void;

    create(
        modelName: string,
        ...traits: string[],
    ): ModelInstance<AnyAttrs>;
    create(
        modelName: string,
        attrs?: AnyAttrs,
        ...traits: string[],
    ): ModelInstance<AnyAttrs>;

    createList(
        modelName: string,
        amount: number,
        ...traits: string[],
    ): Array<ModelInstance<AnyAttrs>>;
    createList(
        modelName: string,
        amount: number,
        attrs?: AnyAttrs,
        ...traits: string[],
    ): Array<ModelInstance<AnyAttrs>>;

    shutdown(): void;
}

export function trait(options: AnyAttrs & {
    afterCreate?: (obj: ModelInstance<AnyAttrs>, server: Server) => void,
}): unknown;

// TODO when https://github.com/Microsoft/TypeScript/issues/1360
// function association(...traits: string[], overrides?: { [key: string]: any }): unknown;
export function association(...args: any[]): unknown;

export const Factory: any;

declare global {
    const server: Server; // TODO: only in tests?
}
