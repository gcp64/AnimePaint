const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  saveFile: (dataUrl, defaultName) => ipcRenderer.invoke('save-file-dialog', dataUrl, defaultName),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});
