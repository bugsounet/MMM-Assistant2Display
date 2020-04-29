const dial = require("peer-dial")
const http = require('http')
const express = require('express')
const { spawn } = require('cross-spawn')
const { IpcClient } = require('./ipc.js')

const app = express()
const server = http.createServer(app)
const PORT = 8569
const MANUFACTURER = "Assistant2Display"
const MODEL_NAME = "DIAL Server"
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

      child.on('close', function(code) {
         console.log('[A2D:CAST]['+code+'] Stop')
      })
    }
  }
}

class DialServer {
  constructor() {
    this.dialServer
    this._mmSendSocket
    this._castAppName = null
    this.config = {}
    this.server = http.createServer(app)
    console.log("[A2D:CAST] Cast started !")
  }

  initDialServer(port) {
    this.dialServer = new dial.Server({
      port,
      corsAllowOrigins: true,
      expressApp: app,
      prefix: "/dial",
      manufacturer: MANUFACTURER,
      modelName: MODEL_NAME,
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

            this.mmSendSocket("CAST_STATUS", castApp.name + " is " + castApp.state)

            castApp.ipc.on('APP_READY', () => {
              castApp.state = "running"
              this._castAppName = appName
              this.mmSendSocket("CAST_STATUS", castApp.name + " is " + castApp.state)
              callback(app.pid)
            })
          }
        },
        stopApp: (appName, pid, callback) => {
          console.log("[A2D:CAST] Request to stop", appName)
          this.mmSendSocket('CAST_STOP')
          const castApp = apps[appName]

          if (castApp && castApp.pid == pid) {
            castApp.ipc.on('QUIT_HEARD', (data) => {
              castApp.ipc.disconnect()
              castApp.state = "stopped"
              castApp.pid = null
              child = null
              this._castAppName = null
              this.mmSendSocket("CAST_STATUS", castApp.name + " is " + castApp.state)
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
    const { castName, port } = this.config
    const usePort = !!port ? port : PORT

    this.initDialServer(usePort)
    if (!!castName) {
      this.dialServer.friendlyName = castName
    }

    this.server.listen(usePort, () => {
      this.dialServer.start()
      this.mmSendSocket("CAST_STATUS", castName + " is listening on port " + usePort)
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

  setConfig(_c) {
    this.config = _c
  }

}

module.exports = DialServer
