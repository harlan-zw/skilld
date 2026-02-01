import { RequestQueueFileSystemEntry } from './fs';
import { RequestQueueMemoryEntry } from './memory';
export declare function createRequestQueueStorageImplementation(options: CreateStorageImplementationOptions): RequestQueueMemoryEntry | RequestQueueFileSystemEntry;
export interface CreateStorageImplementationOptions {
    persistStorage: boolean;
    storeDirectory: string;
    requestId: string;
}
//# sourceMappingURL=index.d.ts.map