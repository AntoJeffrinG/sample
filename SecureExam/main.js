const { app, BrowserWindow, ipcMain, screen } = require('electron');
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html'); // Load login page (index.html)
}

// Function to create the compiler window
function createCompilerWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  compilerWindow = new BrowserWindow({
    width,
    height,
    kiosk: true, // Enable kiosk mode for security
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  compilerWindow.loadFile('compiler.html'); // Load compiler page (compiler.html)
}

// Event when the app is ready
app.whenReady().then(createLoginWindow);

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