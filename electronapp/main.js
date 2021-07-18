const { app, protocol, BrowserWindow } = require("electron");
const path = require("path");

// Start express app
require(path.join(__dirname, "..", "restapi", "server.js"));

function createWindow() {
  const PROTOCOL = "file";
  protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    let url = request.url.substr(PROTOCOL.length + 1);
    url = path.join(__dirname, "dist", url);
    url = path.normalize(url);
    callback({ path: url });
  });

  const window = new BrowserWindow({
    show: false,
  });
  window.loadURL("file:///index.html");
  window.maximize();
  window.show();
}

app.whenReady().then(() => {
  createWindow();
});
