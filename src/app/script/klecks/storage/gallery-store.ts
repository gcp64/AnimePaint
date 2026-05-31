import { KL_INDEXED_DB, BROWSER_STORAGE_STORE, IMAGE_DATA_STORE } from './kl-indexed-db';
import { randomUuid, isBlob } from '../../bb/base/base';
import { TKlProject } from '../kl-types';
import { ProjectConverter } from './project-converter';

export type TGalleryProjectMeta = {
    projectId: string;
    title: string;
    width: number;
    height: number;
    timestamp: number;
    thumbnailBlob: Blob;
};

export class GalleryStore {
    async listProjects(): Promise<TGalleryProjectMeta[]> {
        if (!KL_INDEXED_DB.getIsAvailable()) {
            return [];
        }
        try {
            const keys = await KL_INDEXED_DB.getKeys(BROWSER_STORAGE_STORE);
            // Filter out key '1' (the active autosave/workspace project buffer)
            const projectKeys = keys.filter(k => k !== '1');
            if (projectKeys.length === 0) return [];
            
            const results = await KL_INDEXED_DB.bulkGet(BROWSER_STORAGE_STORE, projectKeys);
            const list: TGalleryProjectMeta[] = [];
            
            for (const key of Object.keys(results)) {
                const raw = results[key] as any;
                if (!raw) continue;
                
                let thumbnailBlob: Blob | undefined;
                if (raw.thumbnail && raw.thumbnail.id) {
                    const readResult = await KL_INDEXED_DB.get(IMAGE_DATA_STORE, raw.thumbnail.id);
                    if (isBlob(readResult)) {
                        thumbnailBlob = readResult;
                    }
                }
                
                list.push({
                    projectId: raw.projectId,
                    title: raw.title || 'لوحة بدون عنوان',
                    width: raw.width,
                    height: raw.height,
                    timestamp: raw.timestamp || Date.now(),
                    thumbnailBlob: thumbnailBlob || new Blob(),
                });
            }
            
            // Sort by timestamp descending (newest first)
            return list.sort((a, b) => b.timestamp - a.timestamp);
        } catch (e) {
            console.error('GalleryStore listProjects error:', e);
            return [];
        }
    }

    async saveProject(project: TKlProject, title: string): Promise<void> {
        if (!KL_INDEXED_DB.getIsAvailable()) {
            return;
        }
        const key = project.projectId;
        
        try {
            // Find obsolete blobs to clean them up from IMAGE_DATA_STORE
            const rawOld = (await KL_INDEXED_DB.get(BROWSER_STORAGE_STORE, key)) as any;
            const deleteIds: string[] = [];
            if (rawOld) {
                if (rawOld.thumbnail && rawOld.thumbnail.id) {
                    deleteIds.push(rawOld.thumbnail.id);
                }
                if (rawOld.layers) {
                    for (const layer of rawOld.layers) {
                        if (layer.blob && layer.blob.id) {
                            deleteIds.push(layer.blob.id);
                        }
                    }
                }
            }
            
            // Convert current project to storage structure
            const storageProject = await ProjectConverter.createStorageProject(project);
            
            const imageDataList: { id: string; data: Blob }[] = [];
            const thumbnail = {
                id: randomUuid(),
            };
            imageDataList.push({
                id: thumbnail.id,
                data: storageProject.thumbnail!,
            });
            
            const layers: any[] = [];
            for (const layer of storageProject.layers) {
                const blob = {
                    id: randomUuid(),
                };
                imageDataList.push({
                    id: blob.id,
                    data: layer.blob,
                });
                layers.push({
                    ...layer,
                    blob,
                });
            }
            
            const raw: any = {
                ...storageProject,
                id: key, // Set key field for IndexedDB keyPath
                title: title || 'لوحة بدون عنوان',
                thumbnail,
                layers,
            };
            
            // Write blobs to IMAGE_DATA_STORE
            for (const imageData of imageDataList) {
                await KL_INDEXED_DB.set(IMAGE_DATA_STORE, imageData.id, imageData.data);
            }
            // Write project metadata and references to BROWSER_STORAGE_STORE
            await KL_INDEXED_DB.set(BROWSER_STORAGE_STORE, key, raw);
            
            // Clean up obsolete blobs
            for (const id of deleteIds) {
                await KL_INDEXED_DB.remove(IMAGE_DATA_STORE, id);
            }
        } catch (e) {
            console.error('GalleryStore saveProject error:', e);
            throw e;
        }
    }

    async loadProject(projectId: string): Promise<TKlProject | undefined> {
        if (!KL_INDEXED_DB.getIsAvailable()) {
            return undefined;
        }
        try {
            const raw = (await KL_INDEXED_DB.get(BROWSER_STORAGE_STORE, projectId)) as any;
            if (!raw) return undefined;
            
            const layers: any[] = [];
            for (const layer of raw.layers) {
                let blob: Blob | undefined;
                if (layer.blob && layer.blob.id) {
                    const readResult = await KL_INDEXED_DB.get(IMAGE_DATA_STORE, layer.blob.id);
                    if (isBlob(readResult)) {
                        blob = readResult;
                    }
                }
                layers.push({
                    ...layer,
                    blob,
                });
            }
            
            const storageProjectRead = {
                ...raw,
                layers,
            };
            
            const readResult = await ProjectConverter.readStorageProject(storageProjectRead);
            (readResult.project as any).title = raw.title || 'لوحة بدون عنوان';
            return readResult.project;
        } catch (e) {
            console.error('GalleryStore loadProject error:', e);
            return undefined;
        }
    }

    async deleteProject(projectId: string): Promise<void> {
        if (!KL_INDEXED_DB.getIsAvailable()) {
            return;
        }
        try {
            const raw = (await KL_INDEXED_DB.get(BROWSER_STORAGE_STORE, projectId)) as any;
            if (!raw) return;
            
            const deleteIds: string[] = [];
            if (raw.thumbnail && raw.thumbnail.id) {
                deleteIds.push(raw.thumbnail.id);
            }
            if (raw.layers) {
                for (const layer of raw.layers) {
                    if (layer.blob && layer.blob.id) {
                        deleteIds.push(layer.blob.id);
                    }
                }
            }
            
            await KL_INDEXED_DB.remove(BROWSER_STORAGE_STORE, projectId);
            for (const id of deleteIds) {
                await KL_INDEXED_DB.remove(IMAGE_DATA_STORE, id);
            }
        } catch (e) {
            console.error('GalleryStore deleteProject error:', e);
        }
    }

    async renameProject(projectId: string, newTitle: string): Promise<void> {
        if (!KL_INDEXED_DB.getIsAvailable()) {
            return;
        }
        try {
            const raw = (await KL_INDEXED_DB.get(BROWSER_STORAGE_STORE, projectId)) as any;
            if (!raw) return;
            raw.title = newTitle;
            await KL_INDEXED_DB.set(BROWSER_STORAGE_STORE, projectId, raw);
        } catch (e) {
            console.error('GalleryStore renameProject error:', e);
        }
    }
}
