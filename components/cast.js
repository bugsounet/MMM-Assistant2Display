const electron = require('electron')
const { IpcServer } = require('./ipc.js')

const ipcInstance = new IpcServer()
const app = electron.app
const userAgent = 'Mozilla/5.0 (SMART-TV; Linux; Tizen 2.4.0) AppleWebkit/538.1 (KHTML, like Gecko) SamsungBrowser/1.1 TV Safari/538.1'

ipcInstance.on('QUIT', (data, socket) => {
  ipcInstance.emit(socket, 'QUIT_HEARD', {})
  app.quit()
  process.exit()
})

/** just for comunicate with YouTube and A2D **/
/** not displayed **/
app.once('ready', () => {
  electron.session.defaultSession.setUserAgent(userAgent)
  ipcInstance.on('SEND_CONFIG', (data, socket) => {
    const windowOptions = {
      maxHeight: 0,
      maxWidth: 0,
      width: 0,
      height: 0,
      show: false,
    }

    const screenCastWindow = new electron.BrowserWindow(windowOptions)
    screenCastWindow.loadURL("https://www.youtube.com/tv")
    screenCastWindow.once('ready-to-show', () => {
      ipcInstance.emit(socket, 'APP_READY', {})
    })
  })
})
