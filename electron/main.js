/**
 * 🖥️ Electron Main Process - CheckMed Desktop
 * 
 * ⚠️ IMPORTANTE: Antes de rodar, inicie o servidor Next.js:
 *    npm run dev
 */

const { app, BrowserWindow, shell, Menu, Tray, nativeImage, dialog, globalShortcut } = require('electron');
const path = require('path');

// Configurações
const isDev = !app.isPackaged;
const PORT = process.env.PORT || 3000;
const SERVER_URL = `http://localhost:${PORT}`;

let mainWindow = null;
let tray = null;

// Função para criar a janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        title: 'CheckMed - Sistema Médico',
        icon: path.join(__dirname, '../public/icon-512.png'),
        backgroundColor: '#0f172a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: false, // Mostra menu com navegação
        show: false,
    });

    // Menu com navegação
    const menuTemplate = [
        {
            label: '✨ CheckMed',
            submenu: [
                { label: 'Sobre', role: 'about' },
                { type: 'separator' },
                { label: 'Sair', accelerator: 'CmdOrCtrl+Q', click: () => { app.isQuiting = true; app.quit(); } }
            ]
        },
        {
            label: '🧭 Navegação',
            submenu: [
                {
                    label: '⬅️ Voltar',
                    accelerator: 'Alt+Left',
                    click: () => mainWindow.webContents.goBack()
                },
                {
                    label: '➡️ Avançar',
                    accelerator: 'Alt+Right',
                    click: () => mainWindow.webContents.goForward()
                },
                {
                    label: '🔄 Recarregar',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => mainWindow.webContents.reload()
                },
                { type: 'separator' },
                {
                    label: '🏠 Dashboard',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => mainWindow.loadURL(`${SERVER_URL}/dashboard`)
                },
                {
                    label: '📅 Agenda',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => mainWindow.loadURL(`${SERVER_URL}/dashboard/agenda`)
                },
                {
                    label: '💻 Telemedicina',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => mainWindow.loadURL(`${SERVER_URL}/dashboard/telemed`)
                },
                {
                    label: '📺 Modo TV',
                    accelerator: 'CmdOrCtrl+T',
                    click: () => mainWindow.loadURL(`${SERVER_URL}/tv`)
                },
            ]
        },
        {
            label: '👁️ Visualização',
            submenu: [
                { label: 'Tela Cheia', accelerator: 'F11', role: 'togglefullscreen' },
                { label: 'Zoom +', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Zoom -', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { label: 'Zoom Normal', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { type: 'separator' },
                { label: 'DevTools', accelerator: 'F12', role: 'toggleDevTools', visible: isDev }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // Carrega o app
    mainWindow.loadURL(SERVER_URL);

    // Mostra janela quando carregou
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        }
    });

    // Erro ao carregar
    mainWindow.webContents.on('did-fail-load', () => {
        dialog.showErrorBox(
            '🔌 Servidor não encontrado',
            `Não foi possível conectar ao servidor.\n\n` +
            `1. Abra um terminal na pasta do projeto\n` +
            `2. Execute: npm run dev\n` +
            `3. Aguarde "Ready" aparecer\n` +
            `4. Abra o CheckMed novamente`
        );
    });

    // Links externos → navegador
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) shell.openExternal(url);
        return { action: 'deny' };
    });

    // Fechar → minimizar para bandeja
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // Atalhos globais de navegação
    mainWindow.webContents.on('before-input-event', (event, input) => {
        // Backspace pra voltar (quando não estiver num input)
        if (input.key === 'Backspace' && !input.alt && !input.control) {
            // Só previne se não for input/textarea
            mainWindow.webContents.executeJavaScript(`
                document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA'
            `).then(isNotInput => {
                if (isNotInput) mainWindow.webContents.goBack();
            });
        }
    });
}

// System Tray
function createTray() {
    try {
        const iconPath = path.join(__dirname, '../public/icon-512.png');
        const icon = nativeImage.createFromPath(iconPath);
        if (icon.isEmpty()) return;

        tray = new Tray(icon.resize({ width: 16, height: 16 }));

        const contextMenu = Menu.buildFromTemplate([
            { label: '📱 Abrir CheckMed', click: () => mainWindow.show() },
            { type: 'separator' },
            { label: '🏠 Dashboard', click: () => { mainWindow.show(); mainWindow.loadURL(`${SERVER_URL}/dashboard`); } },
            { label: '📅 Agenda', click: () => { mainWindow.show(); mainWindow.loadURL(`${SERVER_URL}/dashboard/agenda`); } },
            { label: '📺 Modo TV', click: () => { mainWindow.show(); mainWindow.loadURL(`${SERVER_URL}/tv`); } },
            { type: 'separator' },
            { label: '❌ Sair', click: () => { app.isQuiting = true; app.quit(); } }
        ]);

        tray.setToolTip('CheckMed - Sistema Médico');
        tray.setContextMenu(contextMenu);
        tray.on('double-click', () => mainWindow.show());
    } catch (e) {
        console.error('Erro no tray:', e);
    }
}

// App Ready
app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
        else mainWindow.show();
    });
});

// Windows/Linux: fecha ao fechar todas janelas
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });
}
