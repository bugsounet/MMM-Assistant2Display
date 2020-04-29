/** node helper **/

var exec = require('child_process').exec
var NodeHelper = require("node_helper")

var _log = function() {
  var context = "[A2D]"
  return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

module.exports = NodeHelper.create({

  start: function () {
    this.config = {}
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        this.initialize(payload)
        break
      case "SET_VOLUME":
        this.setVolume(payload)
        break
      case "SCREEN_LOCK":
        if (payload) this.screen.lock()
        else this.screen.unlock()
        break
      case "SCREEN_STOP":
        this.screen.stop()
        break
      case "SCREEN_RESET":
        this.screen.reset()
        break
      case "SCREEN_WAKEUP":
        this.screen.wakeup()
        break
      case "RESTART":
        this.pm2Restart(payload)
        break
    }
  },

  initialize: function(config) {
    this.config = config
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    if (this.config.useA2D) {
      this.addons()
      console.log("[A2D] Initialized: Assistant2Display Version",  require('./package.json').version)
    }
    else console.log("[A2D] Disabled.")
  },

  callback: function(send,params) {
    if (send) this.sendSocketNotification(send,params)
    //log("Socket callback: " + send,params ? params : "")
  },

  setVolume: function(level) {
    var script = this.config.volumeScript.replace("#VOLUME#", level)
    exec (script, (err, stdout, stderr)=> {
      if (err) console.log("[A2D:VOLUME] Set Volume Error:", err)
      else log("[VOLUME] Set Volume To:", level)
    })
  },

  pm2Restart: function(id) {
    var pm2 = "pm2 restart " + id
    exec (pm2, (err, stdout, stderr)=> {
      if (err) console.log("[A2D:PM2] " + err)
      else log("[PM2] Restart", id)
    })
  },

  addons: function () {
    var callbacks= {
      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      "screen": (param) => {
        if (this.screen && param == "WAKEUP") this.screen.wakeup()
      },
      "governor": (param) => {
        if (this.governor && param == "SLEEPING") this.governor.sleeping()
        if (this.governor && param == "WORKING") this.governor.working()
      }
    }

    if (this.config.screen.useScreen) {
      this.config.screen.debug = this.config.debug
      const Screen = require("./components/screen.js")
      this.screen = new Screen(this.config.screen, callbacks)
      this.screen.activate()
    }
    if (this.config.pir.usePir) {
      this.config.pir.debug = this.config.debug
      const Pir = require("./components/pir.js")
      this.pir = new Pir(this.config.pir, callbacks)
      this.pir.activate()
    }
    if (this.config.governor.useGovernor) {
      this.config.governor.debug = this.config.debug
      const Governor = require("./components/governor.js")
      this.governor = new Governor(this.config.governor)
      this.governor.init()
    }
    if (this.config.internet.useInternet) {
      this.config.internet.debug = this.config.debug
      const Internet = require("./components/internet.js")
      this.internet = new Internet(this.config.internet, callbacks)
      this.internet.activate()
    }
    if (this.config.cast.useCast) {
      const DialServer = require("./components/DialServer.js");
      this.dialServer= new DialServer(),
      this.dialServer.setConfig(this.config.cast);
      this.dialServer.start();
      this.dialServer.mmSendSocket = (noti,payload) => {
        if (noti == "CAST_STATUS") console.log("[A2D:CAST] " + payload);
        if (noti == "CAST_START") this.sendSocketNotification("CAST_START", payload)
        if (noti == "CAST_STOP") this.sendSocketNotification("CAST_STOP") 
      }
    }
  },
});
