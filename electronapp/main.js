const {
  app, protocol, BrowserWindow, shell,
} = require('electron');
const path = require('path');

// Start express app
const startRestAPI = require('csgo-tracker-restapi');

startRestAPI(path.join(__dirname, '..', 'stats.db'));

function createWindow() {
  const FILE_PROTOCOL = 'file';

  protocol.interceptFileProtocol(FILE_PROTOCOL, (request, callback) => {
    let url = request.url.substr(FILE_PROTOCOL.length + 1);
    url = path.join(__dirname, 'resources', url);
    url = path.normalize(url);
    callback({ path: url });
  });

  const window = new BrowserWindow({
    show: false,
    backgroundColor: '#282c34',
  });

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  window.removeMenu();
  window.loadURL('file:///index.html');
  window.maximize();
  window.show();
}

app.whenReady().then(() => {
  createWindow();
});
