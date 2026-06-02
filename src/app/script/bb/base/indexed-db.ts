import { timeoutWrapper } from './base';

export type TIndexedDbUpgrader = (event: IDBVersionChangeEvent) => void;

// 2025-05-20
// Blobs not supported on iPad in private tabs.
// Blobs are required for indexed db to be useful. Data urls would be wasteful.
const areBlobUrlsSupported = async function (): Promise<boolean> {
    return true; // We transparently serialize Blobs to ArrayBuffers, so this is always supported
};

async function serializeBlobs(val: any): Promise<any> {
    if (val === null || val === undefined) {
        return val;
    }
    if (val instanceof Blob) {
        const arrayBuffer = await val.arrayBuffer();
        return {
            __isBlob: true,
            type: val.type,
            data: arrayBuffer
        };
    }
    if (Array.isArray(val)) {
        const result = [];
        for (const item of val) {
            result.push(await serializeBlobs(item));
        }
        return result;
    }
    if (typeof val === 'object') {
        const proto = Object.getPrototypeOf(val);
        if (proto === Object.prototype || proto === null) {
            const result: any = {};
            for (const key of Object.keys(val)) {
                result[key] = await serializeBlobs(val[key]);
            }
            return result;
        }
    }
    return val;
}

function deserializeBlobs(val: any): any {
    if (val === null || val === undefined) {
        return val;
    }
    if (typeof val === 'object') {
        if (val.__isBlob === true) {
            return new Blob([val.data], { type: val.type });
        }
        if (Array.isArray(val)) {
            return val.map(item => deserializeBlobs(item));
        }
        const proto = Object.getPrototypeOf(val);
        if (proto === Object.prototype || proto === null) {
            const result: any = {};
            for (const key of Object.keys(val)) {
                result[key] = deserializeBlobs(val[key]);
            }
            return result;
        }
    }
    return val;
}

// todo would it make sense that a single failure causes a complete failure?
type TGetResultItem = {
    status: 'success' | 'error';
};

export type TIndexedDbParams = object;

export class IndexedDb {
    private dbVersion: number = -1;
    private dbName: string = '';
    private storeNames: string[] = [];
    private db: IDBDatabase | undefined;
    private upgrader: TIndexedDbUpgrader = () => {};
    private isAvailable: boolean = true;
    private disconnectTimeout: ReturnType<typeof setTimeout> | undefined;
    private openTransactionCount: number = 0;

    private disconnect(): void {
        this.db?.close();
        this.db = undefined;
    }

    private async autoDisconnectWrapper<G>(activity: () => Promise<G>): Promise<G> {
        try {
            this.openTransactionCount++;
            clearTimeout(this.disconnectTimeout);
            return await activity();
        } finally {
            this.openTransactionCount--;
            if (this.openTransactionCount === 0) {
                // When a new version of the app upgrades the DB, old tabs holding open connections would
                // block the upgrade.
                // -> Close DB connections when inactive.
                clearTimeout(this.disconnectTimeout);
                this.disconnectTimeout = setTimeout(() => this.disconnect(), 1000);
            }
        }
    }

    private async openDb(): Promise<void> {
        if (this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                this.upgrader(event);
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                this.db.onversionchange = () => {
                    this.disconnect();
                    throw new Error('idb onversionchange');
                };
                resolve();
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    private getTransaction(
        storeName: string,
        mode: IDBTransactionMode,
    ): { transaction: IDBTransaction; objectStore: IDBObjectStore } {
        if (!this.storeNames.includes(storeName)) {
            throw new Error(`indexedDb store "${storeName}" not found in "${this.dbName}"`);
        }

        const transaction = this.db!.transaction(storeName, mode);
        return {
            transaction,
            objectStore: transaction.objectStore(storeName),
        };
    }

    // ----------------------------------- public -----------------------------------
    constructor(p: TIndexedDbParams) {}

    init(
        dbName: string,
        objectStoreNames: string[],
        version: number,
        upgrader: TIndexedDbUpgrader,
    ) {
        if (this.dbName !== '') {
            throw new Error('IndexedDb already initialized');
        }

        this.dbName = dbName;
        this.storeNames = [...objectStoreNames];
        this.dbVersion = version;
        this.upgrader = upgrader;
    }

    async testConnection(): Promise<boolean> {
        if (typeof indexedDB === 'undefined') {
            this.isAvailable = false;
            return false;
        }
        try {
            for (const name of this.storeNames) {
                await timeoutWrapper(this.openDb(), 'indexed-db.testConnection.openDb');
                const { transaction } = this.getTransaction(name, 'readonly');
                transaction.abort();
            }
            this.isAvailable = true;
            return true;
        } catch (e) {
            console.error('indexed-db testConnection error:', e);
            // DO NOT brick the connection forever; keep isAvailable true so we can retry saving later!
            this.isAvailable = true;
            return false;
        }
    }

    async set(store: string, key: IDBValidKey | undefined, value: unknown): Promise<void> {
        const serializedValue = await serializeBlobs(value);
        return this.autoDisconnectWrapper(async () => {
            await this.openDb();
            return await new Promise((resolve, reject) => {
                const { transaction, objectStore } = this.getTransaction(store, 'readwrite');
                transaction.onabort = () => reject(transaction.error);
                const request = objectStore.keyPath ? objectStore.put(serializedValue) : objectStore.put(serializedValue, key);
                request.onsuccess = () => {
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        });
    }

    async get(store: string, key: IDBValidKey): Promise<unknown> {
        return this.autoDisconnectWrapper(async () => {
            await this.openDb();
            return await new Promise((resolve, reject) => {
                const { transaction, objectStore } = this.getTransaction(store, 'readonly');
                transaction.onabort = () => reject(transaction.error);
                const request = objectStore.get(key);
                request.onsuccess = () => resolve(deserializeBlobs(request.result));
                request.onerror = () => reject(request.error);
            });
        });
    }

    async has(store: string, key: IDBValidKey): Promise<boolean> {
        return this.autoDisconnectWrapper(async () => {
            await this.openDb();
            return await new Promise((resolve, reject) => {
                const { transaction, objectStore } = this.getTransaction(store, 'readonly');
                transaction.onabort = () => reject(transaction.error);
                const request = objectStore.getKey(key);
                request.onsuccess = () => resolve(!!request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    async getKeys(store: string): Promise<string[]> {
        return this.autoDisconnectWrapper(async () => {
            await this.openDb();
            return await new Promise((resolve, reject) => {
                const { transaction, objectStore } = this.getTransaction(store, 'readonly');
                transaction.onabort = () => reject(transaction.error);
                const request = objectStore.getAllKeys();
                request.onsuccess = () => resolve(request.result.map((key) => key.toString()));
                request.onerror = () => reject(request.error);
            });
        });
    }

    async remove(store: string, key: IDBValidKey): Promise<void> {
        return this.autoDisconnectWrapper(async () => {
            await this.openDb();
            return await new Promise((resolve, reject) => {
                const { transaction, objectStore } = this.getTransaction(store, 'readwrite');
                transaction.onabort = () => reject(transaction.error);
                const request = objectStore.delete(key);
                request.onsuccess = () => {
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        });
    }

    async bulkSet(
        store: string,
        entries: { key: IDBValidKey | undefined; value: unknown }[],
    ): Promise<void> {
        const serializedEntries = await Promise.all(entries.map(async (entry) => ({
            key: entry.key,
            value: await serializeBlobs(entry.value)
        })));
        return this.autoDisconnectWrapper(async () => {
            await this.openDb();
            return new Promise((resolve, reject) => {
                const { transaction, objectStore } = this.getTransaction(store, 'readwrite');
                transaction.onabort = () => reject(transaction.error);
                transaction.onerror = () => reject(transaction.error);
                transaction.oncomplete = () => resolve();

                for (const { key, value } of serializedEntries) {
                    const request = objectStore.keyPath ? objectStore.put(value) : objectStore.put(value, key);
                    request.onerror = () => reject(request.error);
                }
            });
        });
    }

    async bulkGet(store: string, keys: IDBValidKey[]): Promise<Record<string, unknown>> {
        return this.autoDisconnectWrapper(async () => {
            await this.openDb();
            return new Promise((resolve, reject) => {
                const results: Record<string, unknown> = {};
                const { transaction, objectStore } = this.getTransaction(store, 'readonly');
                transaction.onabort = () => reject(transaction.error);
                transaction.onerror = () => reject(transaction.error);
                transaction.oncomplete = () => {
                    const deserializedResults: Record<string, unknown> = {};
                    for (const key of Object.keys(results)) {
                        deserializedResults[key] = deserializeBlobs(results[key]);
                    }
                    resolve(deserializedResults);
                };

                keys.forEach((key, idx) => {
                    const request = objectStore.get(key);
                    request.onsuccess = () => (results['' + key] = request.result);
                    request.onerror = () => reject(request.error);
                });
            });
        });
    }

    async bulkRemove(store: string, keys: IDBValidKey[]): Promise<void> {
        return this.autoDisconnectWrapper(async () => {
            await this.openDb();
            return new Promise((resolve, reject) => {
                const { transaction, objectStore } = this.getTransaction(store, 'readwrite');
                transaction.onabort = () => reject(transaction.error);
                transaction.onerror = () => reject(transaction.error);
                transaction.oncomplete = () => resolve();

                for (const key of keys) {
                    const request = objectStore.delete(key);
                    request.onerror = () => reject(request.error);
                }
            });
        });
    }

    getIsAvailable(): boolean {
        return this.isAvailable;
    }

    destroy(): void {
        this.disconnect();
    }
}
