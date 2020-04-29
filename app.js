const electron = require('electron');
const { IpcServer } = require('./ipc.js');

const ipcInstance = new IpcServer();
const app = electron.app;

ipcInstance.on('QUIT', (data, socket) => {
  ipcInstance.emit(socket, 'QUIT_HEARD', {});
  app.quit();
  process.exit();
});

app.once('ready', () => {
  ipcInstance.on('SEND_CONFIG', (data, socket) => {
    const windowOptions = {
      maxHeight: 0,
      maxWidth: 0,
      width: 0,
      height: 0,
      show: false,
    };

    const screenCastWindow = new electron.BrowserWindow(windowOptions);
    screenCastWindow.loadURL("https://www.youtube.com/tv");
    screenCastWindow.once('ready-to-show', () => {
      ipcInstance.emit(socket, 'APP_READY', {});
    });
  });
});
