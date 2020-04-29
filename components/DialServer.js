const dial = require("peer-dial")
const http = require('http')
const express = require('express')
const { spawn } = require('cross-spawn')
const { IpcClient } = require('./ipc.js')

const app = express()
const server = http.createServer(app)
let child = null

const apps = {
  "YouTube": {
    name: "YouTube",
    state: "stopped",
    allowStop: true,
    pid: null,
    launch: function (launchData, config) {
      child = spawn('npm', ['run', 'cast'], {
        cwd: 'modules/MMM-Assistant2Display'
      })

      this.ipc = new IpcClient((self) => {
        self.on('connect', (data) => {
          self.emit('SEND_CONFIG', { ...config })
        })
        self.on('error', (error) => console.log("[A2D:CAST] " + error))
      })
    }
  }
}

var _log = function() {
    var context = "[A2D:CAST]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class DialServer {
  constructor(config) {
    this.dialServer
    this._mmSendSocket
    this._castAppName = null
    this.config = config
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    this.server = http.createServer(app)
    console.log("[A2D:CAST] Initialized")
  }

  initDialServer(port) {
    this.dialServer = new dial.Server({
      port,
      corsAllowOrigins: true,
      expressApp: app,
      prefix: "/dial",
      manufacturer: "Assistant2Display",
      modelName: "DIAL Server",
      launchFunction: null,
      delegate: {
        getApp: function(appName) {
          return apps[appName]
        },

        launchApp: (appName, lauchData, callback) => {
          const castApp = apps[appName]
          if (!!castApp) {
            castApp.pid = "run"
            castApp.state = "starting"
            castApp.launch(lauchData, this.config)
            const url = "https://www.youtube.com/tv?"+lauchData
            this.mmSendSocket('CAST_START', url)
            log(castApp.name + " is" + castApp.state)

            castApp.ipc.on('APP_READY', () => {
              castApp.state = "running"
              this._castAppName = appName
              log(castApp.name + " is " + castApp.state)
              callback(app.pid)
            })
          }
        },
        stopApp: (appName, pid, callback) => {
          this.mmSendSocket('CAST_STOP')
          const castApp = apps[appName]

          if (castApp && castApp.pid == pid) {
            castApp.ipc.on('QUIT_HEARD', (data) => {
              castApp.ipc.disconnect()
              castApp.state = "stopped"
              castApp.pid = null
              child = null
              this._castAppName = null
              log(castApp.name + " is " + castApp.state)
              callback(true)
            })

            castApp.ipc.emit('QUIT')
          } else {
            callback(false)
          }
        }
      }
    })
  }

  start() {
    this.initDialServer(this.config.port)
    this.dialServer.friendlyName = this.config.castName
    this.server.listen(this.config.port, () => {
      this.dialServer.start()
      log(this.config.castName + " is listening on port", this.config.port)
    })
  }

  get castSocket() {
    return apps[this._castAppName].ipc
 }

  get mmSendSocket() {
    return this._mmSendSocket
  }

  set mmSendSocket(socket) {
    return this._mmSendSocket = socket
  }
}

module.exports = DialServer
