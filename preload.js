const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Renderer to Main (one-way)
    showBlockedNavigationDialog: (url) => ipcRenderer.send('show-blocked-navigation-dialog', url),

    // From webview content to renderer process
    sendNavigation: (url) => {
        ipcRenderer.sendToHost('navigate-from-webview', url);
    },

    // To renderer process from webview via main
    onNavigationRequest: (callback) => {
        // The webview's `sendToHost` is received by the preload script of the host window
        ipcRenderer.on('navigate-from-webview', (event, url) => {
            callback(url);
        });
    }
});