const { app, protocol, BrowserWindow } = require('electron');
const path = require('path');

// Start express app
const startRestAPI = require('csgo-tracker-restapi');
startRestAPI(path.join(__dirname, '..', 'stats.db'));

function createWindow() {
  const PROTOCOL = 'file';
  protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    let url = request.url.substr(PROTOCOL.length + 1);
    url = path.join(__dirname, 'resources', url);
    url = path.normalize(url);
    callback({ path: url });
  });

  const window = new BrowserWindow({
    show: false,
    backgroundColor: '#282c34',
  });
  window.removeMenu();
  window.loadURL('file:///index.html');
  window.maximize();
  window.show();
}

app.whenReady().then(() => {
  createWindow();
});
