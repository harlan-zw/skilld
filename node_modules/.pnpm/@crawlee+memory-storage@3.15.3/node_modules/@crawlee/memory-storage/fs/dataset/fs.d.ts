import type { StorageImplementation } from '../common';
import type { CreateStorageImplementationOptions } from './index';
export declare class DatasetFileSystemEntry<Data> implements StorageImplementation<Data> {
    private filePath;
    private fsQueue;
    constructor(options: CreateStorageImplementationOptions);
    get(): Promise<any>;
    update(data: Data): Promise<void>;
    delete(): Promise<void>;
}
//# sourceMappingURL=fs.d.ts.map