const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  saveSale: (saleData) => ipcRenderer.invoke('save-sale', saleData),
  onNewSale: (callback) => ipcRenderer.on('new-sale', callback)
});
