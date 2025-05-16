const {
  app, protocol, BrowserWindow, shell, screen, Tray, Menu, dialog
} = require('electron');
const path = require('path');
const os = require('os');

// Start express app
const startRestAPI = require('csgo-tracker-restapi').default;

const WIDTH = 1776;
const HEIGHT = 1000;

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
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (/^https:\/\//.test(details.url)) shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.removeMenu();
  mainWindow.loadURL('file:///index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
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
