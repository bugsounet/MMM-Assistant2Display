const dial = require("peer-dial")
const express = require('express')
const app = express()

var _log = function() {
    var context = "[A2D:CAST]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class DialServer {
  constructor(config, callbacks) {
    this.dialServer = null
    this.config = config
    this.sendSocketNotification = callbacks.sendSocketNotification
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    this.apps = {
      "YouTube": {
        name: "YouTube",
        state: "stopped",
        allowStop: true,
        pid: null,
        launch: (data) => {
          this.sendSocketNotification("CAST_START", "https://www.youtube.com/tv?" + data)
        }
      }
    }
    this.server = null
    console.log("[A2D:CAST] Initialized")
  }

  initDialServer(port) {
    this.dialServer = new dial.Server({
      expressApp: app,
      port: this.config.port,
      prefix: "/dial",
      corsAllowOrigins: true,
      manufacturer: "Assistant2Display",
      modelName: "MagicMirror²",
      delegate: {
        getApp: (appName) => {
          var app = this.apps[appName] ? this.apps[appName] : "[unknow protocol]"
          log("PONG "+ appName, app)
          return app
        },
        launchApp: (appName,data,callback) => {
          log("Launch " + appName + " with data:", data)
          var app = this.apps[appName]
          var pid = null
          if (app) {
            app.pid = "run"
            app.state = "starting"
            app.launch(data)
            app.state = "running"
          }
          callback(app.pid)
        },
        stopApp: (appName,pid,callback) => {
          log("Stop", appName)
          var app = this.apps[appName]
          if (app && app.pid == pid) {
            app.pid = null
            app.state = "stopped"
            this.sendSocketNotification("CAST_STOP")
            callback(true)
          }
          else {
            callback(false)
          }
        }
      }
    })
  }

  start() {
    this.initDialServer(this.config.port)
    this.dialServer.friendlyName = this.config.castName
    this.server = app.listen(this.config.port, () => {
      this.dialServer.start()
      log(this.config.castName + " is listening on port", this.config.port)
    })
  }
}

module.exports = DialServer
