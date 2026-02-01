import type * as storage from '@crawlee/types';
import type { MemoryStorage } from '../index';
import { BaseClient } from './common/base-client';
export interface KeyValueStoreClientOptions {
    name?: string;
    id?: string;
    baseStorageDirectory: string;
    client: MemoryStorage;
}
export interface InternalKeyRecord {
    key: string;
    value: Buffer | string;
    contentType?: string;
    extension: string;
}
export declare class KeyValueStoreClient extends BaseClient {
    name?: string;
    createdAt: Date;
    accessedAt: Date;
    modifiedAt: Date;
    keyValueStoreDirectory: string;
    private readonly keyValueEntries;
    private readonly client;
    constructor(options: KeyValueStoreClientOptions);
    get(): Promise<storage.KeyValueStoreInfo | undefined>;
    update(newFields?: storage.KeyValueStoreClientUpdateOptions): Promise<storage.KeyValueStoreInfo>;
    delete(): Promise<void>;
    listKeys(options?: storage.KeyValueStoreClientListOptions): Promise<storage.KeyValueStoreClientListData>;
    /**
     * Tests whether a record with the given key exists in the key-value store without retrieving its value.
     *
     * @param key The queried record key.
     * @returns `true` if the record exists, `false` if it does not.
     */
    recordExists(key: string): Promise<boolean>;
    getRecord(key: string, options?: storage.KeyValueStoreClientGetRecordOptions): Promise<storage.KeyValueStoreRecord | undefined>;
    setRecord(record: storage.KeyValueStoreRecord): Promise<void>;
    deleteRecord(key: string): Promise<void>;
    toKeyValueStoreInfo(): storage.KeyValueStoreInfo;
    private updateTimestamps;
}
//# sourceMappingURL=key-value-store.d.ts.map