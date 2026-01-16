const { app, BrowserWindow, globalShortcut, screen } = require('electron');
const path = require('path');

// URL configuration
const PRODUCTION_URL = 'https://checkmed.shop/tv';
const DEV_URL = 'http://localhost:3000/tv';

// Check if running in dev mode via env var or argument
const isDev = process.env.DEV_MODE === '1' || process.argv.includes('--dev');
const TARGET_URL = isDev ? DEV_URL : PRODUCTION_URL;

let mainWindow;

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    mainWindow = new BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        frame: false, // No window frame (close/minimize buttons)
        kiosk: !isDev, // Kiosk mode (fullscreen, always on top) on production
        fullscreen: !isDev,
        alwaysOnTop: !isDev,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../public/icon-512.png'),
        backgroundColor: '#0f172a', // Matches app background
    });

    console.log(`Loading URL: ${TARGET_URL}`);
    mainWindow.loadURL(TARGET_URL).catch((err) => {
        console.error('Failed to load URL:', err);
        // Reload every 10s if connection fails
        setTimeout(() => {
            if (mainWindow) mainWindow.reload();
        }, 10000);
    });

    // Prevent new windows/popups
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    // Global shortcuts
    globalShortcut.register('Escape', () => {
        // In kiosk mode, require long press or password? For now just exit
        // Or maybe just enable Developer Tools for debugging
        console.log('Escape pressed - exiting kiosk check');
    });

    // Super secret exit chord: Ctrl+Shift+Q
    globalShortcut.register('CommandOrControl+Shift+Q', () => {
        app.quit();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
