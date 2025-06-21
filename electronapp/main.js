const {
  app, protocol, BrowserWindow, shell, screen, Tray, Menu, dialog, ipcMain
} = require('electron');
const path = require('path');
const os = require('os');
const AutoLaunch = require('auto-launch');

// Start express app
const startRestAPI = require('csgo-tracker-restapi').default;

const WIDTH = 1776;
const HEIGHT = 1000;

const startsInTray = process.argv.includes('--hidden');

/**
 * @type {BrowserWindow}
 */
let mainWindow;
let tray = null;

startRestAPI(path.join(os.homedir(), '.csgo-tracker', 'stats.db'));

function createTray() {
  const iconPath = path.join(__dirname, 'resources', 'trayIcon.png'); // Add an icon to your resources
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open CSGO Tracker',
      click: () => {
        if (mainWindow) {
          mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('CSGO Tracker');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show();
    } else {
      createWindow();
    }
  });
}

function createWindow() {
  const FILE_PROTOCOL = 'file';

  protocol.interceptFileProtocol(FILE_PROTOCOL, (request, callback) => {
    let url = request.url.substring(FILE_PROTOCOL.length + 1);
    url = path.join(__dirname, 'resources', url);
    url = path.normalize(url);
    callback({ path: url });
  });

  const { screenWidth, screenHeight } = screen.getPrimaryDisplay().workArea;
  mainWindow = new BrowserWindow({
    show: false,
    backgroundColor: '#282c34',
    width: WIDTH,
    height: HEIGHT,
    x: screenWidth / 2 - WIDTH / 2,
    y: screenHeight / 2 - HEIGHT / 2,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (/^https:\/\//.test(details.url)) shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.removeMenu();
  mainWindow.loadURL('file:///index.html');

  mainWindow.once('ready-to-show', () => {
    if (startsInTray) {
      mainWindow?.hide();
    } else {
      mainWindow?.show();
    }
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      
      dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Run in the background', 'Quit'],
        defaultId: 0,
        title: 'Close CSGO Tracker',
        message: 'Would you like to run the app in the background (Minimized to tray) or quit the application?'
      }).then(({ response }) => {
        if (response === 0) {
          mainWindow.destroy();
          mainWindow = null;
        } else {
          app.isQuitting = true;
          app.quit();
        }
      });
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!app.isQuitting) return;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Setup auto-launch
const autoLauncher = new AutoLaunch({
  name: 'CSGO Tracker',
  isHidden: true
});

// IPC handlers for auto-launch functionality
ipcMain.handle('get-auto-launch-status', async () => {
  try {
    return await autoLauncher.isEnabled();
  } catch (err) {
    console.error('Auto-launch status error:', err);
    return false;
  }
});

ipcMain.handle('set-auto-launch', async (event, enabled) => {
  try {
    if (enabled) {
      await autoLauncher.enable();
      console.log("Autolaunch enabled");
      
    } else {
      await autoLauncher.disable();
      console.log("Autolaunch disabled");
      
    }
    return true;
  } catch (err) {
    console.error('Auto-launch set error:', err);
    return false;
  }
});
