const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí podemos exponer funciones seguras al frontend
  getVersion: () => process.versions.electron
});
