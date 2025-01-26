const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');
const path = require('path');

let mainWindow; // Login window
let compilerWindow; // Compiler window

// Function to create the login window
function createLoginWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    kiosk: true, // Enable kiosk mode for security
    fullscreen: true, // Enforcing fullscreen mode
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html'); // Load login page (index.html)

  // Prevent tab switching (use keyboard event restrictions or other methods)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Disable alt+tab, Ctrl+Tab, or other key combinations
    if (input.key === 'Tab' || input.alt || input.ctrl || input.meta) {
      event.preventDefault();
    }
  });
}

// Function to create the compiler window
function createCompilerWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  compilerWindow = new BrowserWindow({
    width,
    height,
    kiosk: true, // Enable kiosk mode for security
    fullscreen: true, // Enforcing fullscreen mode
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  compilerWindow.loadFile('compiler.html'); // Load compiler page (compiler.html)

  // Prevent tab switching (use keyboard event restrictions or other methods)
  compilerWindow.webContents.on('before-input-event', (event, input) => {
    // Disable alt+tab, Ctrl+Tab, or other key combinations
    if (input.key === 'Tab' || input.alt || input.ctrl || input.meta) {
      event.preventDefault();
    }
  });
}

// Event when the app is ready
app.whenReady().then(() => {
  createLoginWindow();
  
  // Global keyboard shortcuts to lock window if needed (e.g., disable alt+tab or any shortcut)
  globalShortcut.register('Alt+Tab', () => {
    // You can define specific behavior here or prevent it
    return true; // Return true to disable Alt+Tab
  });
});

// IPC listener to open the compiler window
ipcMain.on('open-compiler-window', () => {
  // Check if main window exists and close it
  if (mainWindow) {
    mainWindow.close(); // Close the login window
  }

  // Create and show the compiler window
  createCompilerWindow();
});

// IPC listener to return to the login window
ipcMain.on('back-to-login', () => {
  // Check if compiler window exists and close it
  if (compilerWindow) {
    compilerWindow.close(); // Close the compiler window
  }

  // Reopen the login window
  createLoginWindow();
});

// IPC listener to quit the app
ipcMain.on('quit-app', () => {
  app.quit();
});

// Handle closing of all windows
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});