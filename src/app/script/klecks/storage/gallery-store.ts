import { KL_INDEXED_DB, BROWSER_STORAGE_STORE, IMAGE_DATA_STORE } from './kl-indexed-db';
import { randomUuid, isBlob } from '../../bb/base/base';
import { TKlProject } from '../kl-types';
import { ProjectConverter } from './project-converter';
import { requestPersistentStorage } from './request-persistent-storage';
import { drawProject } from '../canvas/draw-project';
import { canvasToBlob } from '../../bb/base/canvas';
import { triggerHaptic } from '../ui/utils/haptic';

export type TGalleryProjectMeta = {
    projectId: string;
    title: string;
    width: number;
    height: number;
    timestamp: number;
    thumbnailBlob: Blob;
};

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

export class GalleryStore {
    private saveLocks: Record<string, boolean> = {};

    async syncNativeStorage(silent: boolean = false): Promise<{ recovered: number; backedUp: number }> {
        let recoveredCount = 0;
        let backedUpCount = 0;
        if (!(window as any).AndroidBridge) {
            return { recovered: 0, backedUp: 0 };
        }
        try {
            const nativeListStr = (window as any).AndroidBridge.listProjectsNative();
            const nativeList = JSON.parse(nativeListStr) as {
                projectId: string;
                title: string;
                width: number;
                height: number;
                timestamp: number;
                thumbnailBase64: string;
            }[];
            
            // 1. Recover from Native to IndexedDB (if missing in IDB)
            const idbKeys = await KL_INDEXED_DB.getKeys(BROWSER_STORAGE_STORE);
            for (const item of nativeList) {
                if (!idbKeys.includes(item.projectId)) {
                    try {
                        const rawJson = (window as any).AndroidBridge.loadProjectNative(item.projectId);
                        if (rawJson) {
                            const payload = JSON.parse(rawJson);
                            
                            // Recreate Blobs
                            const thumbBlob = base64ToBlob(payload.thumbnailBase64, 'image/png');
                            const thumbId = randomUuid();
                            await KL_INDEXED_DB.set(IMAGE_DATA_STORE, thumbId, thumbBlob);
                            
                            const layers = [];
                            for (const l of payload.layers) {
                                const lBlob = base64ToBlob(l.blobBase64, 'image/png');
                                const lBlobId = randomUuid();
                                await KL_INDEXED_DB.set(IMAGE_DATA_STORE, lBlobId, lBlob);
                                layers.push({
                                    name: l.name,
                                    isVisible: l.isVisible,
                                    opacity: l.opacity,
                                    mixModeStr: l.mixModeStr,
                                    blob: { id: lBlobId }
                                });
                            }
                            
                            const raw = {
                                id: item.projectId,
                                projectId: item.projectId,
                                width: payload.width,
                                height: payload.height,
                                timestamp: payload.timestamp,
                                title: payload.title,
                                thumbnail: { id: thumbId },
                                layers: layers
                            };
                            await KL_INDEXED_DB.set(BROWSER_STORAGE_STORE, item.projectId, raw);
                            recoveredCount++;
                        }
                    } catch (err) {
                        console.error('Error recovering project:', item.projectId, err);
                    }
                }
            }
            
            // 2. Backup from IndexedDB to Native (if missing in Native)
            const projectKeys = idbKeys.filter(k => k !== '1');
            const nativeIds = nativeList.map(n => n.projectId);
            
            for (const key of projectKeys) {
                if (!nativeIds.includes(key)) {
                    try {
                        const raw = (await KL_INDEXED_DB.get(BROWSER_STORAGE_STORE, key)) as any;
                        if (raw) {
                            // Extract Blobs
                            const thumbResult = await KL_INDEXED_DB.get(IMAGE_DATA_STORE, raw.thumbnail.id);
                            if (!isBlob(thumbResult)) continue;
                            
                            const layersBase64 = [];
                            let layersOk = true;
                            for (const l of raw.layers) {
                                const lResult = await KL_INDEXED_DB.get(IMAGE_DATA_STORE, l.blob.id);
                                if (!isBlob(lResult)) {
                                    layersOk = false;
                                    break;
                                }
                                layersBase64.push({
                                    name: l.name,
                                    isVisible: l.isVisible,
                                    opacity: l.opacity,
                                    mixModeStr: l.mixModeStr,
                                    blobBase64: await blobToBase64(lResult)
                                });
                            }
                            if (!layersOk) continue;
                            
                            const payload = {
                                projectId: key,
                                title: raw.title || 'لوحة بدون عنوان',
                                width: raw.width,
                                height: raw.height,
                                timestamp: raw.timestamp || Date.now(),
                                thumbnailBase64: await blobToBase64(thumbResult),
                                layers: layersBase64
                            };
                            (window as any).AndroidBridge.saveProjectNative(
                                key,
                                raw.title || 'لوحة بدون عنوان',
                                JSON.stringify(payload)
                            );
                            backedUpCount++;
                        }
                    } catch (err) {
                        console.error('Error backing up project to native:', key, err);
                    }
                }
            }
            
            if (!silent && (recoveredCount > 0 || backedUpCount > 0)) {
                console.log(`Sync complete: Recovered ${recoveredCount} projects, backed up ${backedUpCount} projects.`);
            }
        } catch (e) {
            console.error('syncNativeStorage error:', e);
        }
        return { recovered: recoveredCount, backedUp: backedUpCount };
    }

    async listProjects(): Promise<TGalleryProjectMeta[]> {
        if ((window as any).AndroidBridge) {
            try {
                await this.syncNativeStorage(true);
            } catch (err) {
                console.warn('Auto sync on listProjects failed:', err);
            }
        }
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
            
            // Extract all thumbnail IDs to batch load them
            const thumbIds: string[] = [];
            for (const key of Object.keys(results)) {
                const raw = results[key] as any;
                if (raw && raw.thumbnail && raw.thumbnail.id) {
                    thumbIds.push(raw.thumbnail.id);
                }
            }
            
            const thumbBlobs = thumbIds.length > 0 ? await KL_INDEXED_DB.bulkGet(IMAGE_DATA_STORE, thumbIds) : {};
            
            for (const key of Object.keys(results)) {
                const raw = results[key] as any;
                if (!raw) continue;
                
                let thumbnailBlob: Blob | undefined;
                if (raw.thumbnail && raw.thumbnail.id) {
                    const readResult = thumbBlobs[raw.thumbnail.id];
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
                    thumbnailBlob: thumbnailBlob as any || new Blob(),
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
        try {
            await requestPersistentStorage();
        } catch (e) {
            console.warn('Persistent storage request failed:', e);
        }
        const key = project.projectId;
        
        // Wait if there is a save operation in progress for this project
        while (this.saveLocks[key]) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        this.saveLocks[key] = true;
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
            
            // Mirror to Android Native Storage
            if ((window as any).AndroidBridge) {
                try {
                    const layersBase64 = [];
                    for (let i = 0; i < storageProject.layers.length; i++) {
                        const l = storageProject.layers[i];
                        const lData = imageDataList.find(d => d.id === raw.layers[i].blob.id);
                        if (lData) {
                            layersBase64.push({
                                name: l.name,
                                isVisible: l.isVisible,
                                opacity: l.opacity,
                                mixModeStr: l.mixModeStr,
                                blobBase64: await blobToBase64(lData.data)
                            });
                        }
                    }
                    const payload = {
                        projectId: key,
                        title: title || 'لوحة بدون عنوان',
                        width: storageProject.width,
                        height: storageProject.height,
                        timestamp: storageProject.timestamp,
                        thumbnailBase64: await blobToBase64(storageProject.thumbnail!),
                        layers: layersBase64
                    };
                    (window as any).AndroidBridge.saveProjectNative(
                        key,
                        title || 'لوحة بدون عنوان',
                        JSON.stringify(payload)
                    );
                } catch (err) {
                    console.error('AndroidBridge saveProject native mirror error:', err);
                }
            }

            // Export to phone gallery (Pictures/MariaStudio)
            if ((window as any).AndroidBridge && localStorage.getItem('maria_core_auto_export_gallery') !== 'false') {
                try {
                    const fullCanvas = drawProject(project, 1.0);
                    const fullBlob = await canvasToBlob(fullCanvas, 'image/png');
                    const base64Png = await blobToBase64(fullBlob);
                    (window as any).AndroidBridge.saveImageToGallery(title || 'لوحة بدون عنوان', base64Png);
                } catch (err) {
                    console.error('AndroidBridge saveImageToGallery error:', err);
                }
            }

            // Trigger success haptic vibration
            triggerHaptic(3);
            
            // Clean up obsolete blobs
            for (const id of deleteIds) {
                await KL_INDEXED_DB.remove(IMAGE_DATA_STORE, id);
            }
        } catch (e) {
            console.error('GalleryStore saveProject error:', e);
            throw e;
        } finally {
            this.saveLocks[key] = false;
        }
    }

    async loadProject(projectId: string): Promise<TKlProject | undefined> {
        if (!KL_INDEXED_DB.getIsAvailable()) {
            return undefined;
        }
        
        // Wait if there is a save operation in progress for this project
        while (this.saveLocks[projectId]) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        try {
            const raw = (await KL_INDEXED_DB.get(BROWSER_STORAGE_STORE, projectId)) as any;
            if (!raw) return undefined;
            
            const layers: any[] = [];
            
            // Extract all layer blob IDs to batch load them
            const blobIds: string[] = [];
            for (const layer of raw.layers) {
                if (layer.blob && layer.blob.id) {
                    blobIds.push(layer.blob.id);
                }
            }
            
            const blobs = blobIds.length > 0 ? await KL_INDEXED_DB.bulkGet(IMAGE_DATA_STORE, blobIds) : {};
            
            for (const layer of raw.layers) {
                let blob: Blob | undefined;
                if (layer.blob && layer.blob.id) {
                    const readResult = blobs[layer.blob.id];
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
        
        // Wait if there is a save operation in progress for this project
        while (this.saveLocks[projectId]) {
            await new Promise(resolve => setTimeout(resolve, 50));
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
            if ((window as any).AndroidBridge) {
                try {
                    (window as any).AndroidBridge.deleteProjectNative(projectId);
                } catch (err) {
                    console.error('AndroidBridge delete error:', err);
                }
            }
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
        
        // Wait if there is a save operation in progress for this project
        while (this.saveLocks[projectId]) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        try {
            const raw = (await KL_INDEXED_DB.get(BROWSER_STORAGE_STORE, projectId)) as any;
            if (!raw) return;
            raw.title = newTitle;
            await KL_INDEXED_DB.set(BROWSER_STORAGE_STORE, projectId, raw);
            
            if ((window as any).AndroidBridge) {
                try {
                    const rawJson = (window as any).AndroidBridge.loadProjectNative(projectId);
                    if (rawJson) {
                        const payload = JSON.parse(rawJson);
                        payload.title = newTitle;
                        (window as any).AndroidBridge.saveProjectNative(projectId, newTitle, JSON.stringify(payload));
                    }
                } catch (err) {
                    console.error('AndroidBridge rename error:', err);
                }
            }
        } catch (e) {
            console.error('GalleryStore renameProject error:', e);
        }
    }
}
