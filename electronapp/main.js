const {
  app, protocol, BrowserWindow, shell, screen,
} = require('electron');
const path = require('path');
const os = require('os');

// Start express app
const startRestAPI = require('csgo-tracker-restapi').default;

const WIDTH = 1776;
const HEIGHT = 1000;

startRestAPI(path.join(os.homedir(), '.csgo-tracker', 'stats.db'));

function createWindow() {
  const FILE_PROTOCOL = 'file';

  protocol.interceptFileProtocol(FILE_PROTOCOL, (request, callback) => {
    let url = request.url.substring(FILE_PROTOCOL.length + 1);
    url = path.join(__dirname, 'resources', url);
    url = path.normalize(url);
    callback({ path: url });
  });

  const { screenWidth, screenHeight } = screen.getPrimaryDisplay().workArea;

  const window = new BrowserWindow({
    show: false,
    backgroundColor: '#282c34',
    width: WIDTH,
    height: HEIGHT,
    x: screenWidth / 2 - WIDTH / 2,
    y: screenHeight / 2 - HEIGHT / 2,
  });

  window.webContents.setWindowOpenHandler((details) => {
    if (/^https:\/\//.test(details.url)) shell.openExternal(details.url);
    return { action: 'deny' };
  });

  window.removeMenu();
  window.loadURL('file:///index.html');

  window.once('ready-to-show', () => {
    window.show();
  });
}

app.whenReady().then(() => {
  createWindow();
});
