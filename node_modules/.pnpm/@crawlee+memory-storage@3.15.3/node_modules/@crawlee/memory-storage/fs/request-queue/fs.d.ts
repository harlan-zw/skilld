import type { InternalRequest } from '../../resource-clients/request-queue';
import type { StorageImplementation } from '../common';
import type { CreateStorageImplementationOptions } from '.';
export declare class RequestQueueFileSystemEntry implements StorageImplementation<InternalRequest> {
    private filePath;
    private fsQueue;
    private data?;
    private directoryExists;
    /**
     * A "sweep" timeout that is created/refreshed whenever this entry is accessed/updated.
     * It exists to ensure that the entry is not kept in memory indefinitely, by sweeping it after 60 seconds of inactivity (in order to keep memory usage low)
     */
    private sweepTimeout?;
    orderNo?: number | null;
    constructor(options: CreateStorageImplementationOptions);
    get(force?: boolean): Promise<any>;
    update(data: InternalRequest): Promise<void>;
    delete(): Promise<void>;
    private setOrRefreshSweepTimeout;
}
//# sourceMappingURL=fs.d.ts.map