const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Enable kiosk mode
  enableKioskMode: () => ipcRenderer.send('enable-kiosk-mode'),

  // Quit the application
  quitApp: () => ipcRenderer.send('quit-app'),

  // Open the compiler window
  openCompilerWindow: () => ipcRenderer.send('open-compiler-window'),

  // Handle the action of returning to the login screen
  backToLogin: () => ipcRenderer.send('back-to-login'),

  // Listen for events from the main process
  onEvent: (channel, callback) => {
    const validChannels = ['timer-update', 'gui-closed']; // Add more valid channels as needed
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    } else {
      console.error(`Invalid channel: ${channel}`);
    }
  },

  // Send data to the main process
  sendEvent: (channel, data) => {
    const validChannels = ['run-code', 'log-event']; // Add more valid channels as needed
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.error(`Invalid channel: ${channel}`);
    }
  },
});