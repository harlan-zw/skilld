import type { StorageClient } from '@crawlee/types';
import { Configuration } from '../configuration';
import type { ProxyConfiguration } from '../proxy_configuration';
import type { Constructor } from '../typedefs';
export interface IStorage {
    id: string;
    name?: string;
}
/**
 * StorageManager takes care of opening remote or local storages.
 * @ignore
 */
export declare class StorageManager<T extends IStorage = IStorage> {
    private readonly config;
    private readonly name;
    private readonly StorageConstructor;
    private readonly cache;
    private readonly storageOpenQueue;
    constructor(StorageConstructor: Constructor<T>, config?: Configuration);
    static openStorage<T extends IStorage>(storageClass: Constructor<T>, idOrName?: string, client?: StorageClient, config?: Configuration): Promise<T>;
    static getManager<T extends IStorage>(storageClass: Constructor<T>, config?: Configuration): StorageManager<T>;
    /** @internal */
    static clearCache(config?: Configuration): void;
    openStorage(idOrName?: string | null, client?: StorageClient): Promise<T>;
    closeStorage(storage: {
        id: string;
        name?: string;
    }): void;
    /**
     * Helper function that first requests storage by ID and if storage doesn't exist then gets it by name.
     */
// @ts-ignore optional peer dependency or compatibility with es2022
    protected _getOrCreateStorage(storageIdOrName: string, storageConstructorName: string, apiClient: StorageClient): Promise<import("@crawlee/types").DatasetCollectionData>;
    protected _getStorageClientFactories(client: StorageClient, storageConstructorName: string): {
// @ts-ignore optional peer dependency or compatibility with es2022
        createStorageClient: ((id: string) => import("@crawlee/types").DatasetClient) | ((id: string) => import("@crawlee/types").KeyValueStoreClient) | ((id: string, options?: import("@crawlee/types").RequestQueueOptions) => import("@crawlee/types").RequestQueueClient);
// @ts-ignore optional peer dependency or compatibility with es2022
        createStorageCollectionClient: (() => import("@crawlee/types").DatasetCollectionClient) | (() => import("@crawlee/types").KeyValueStoreCollectionClient) | (() => import("@crawlee/types").RequestQueueCollectionClient);
    };
    protected _addStorageToCache(storage: T): void;
}
export interface StorageManagerOptions {
    /**
     * SDK configuration instance, defaults to the static register.
     */
    config?: Configuration;
    /**
     * Optional storage client that should be used to open storages.
     */
    storageClient?: StorageClient;
    /**
     * Used to pass the proxy configuration for the `requestsFromUrl` objects.
     * Takes advantage of the internal address rotation and authentication process.
     * If undefined, the `requestsFromUrl` requests will be made without proxy.
     */
    proxyConfiguration?: ProxyConfiguration;
}
//# sourceMappingURL=storage_manager.d.ts.map