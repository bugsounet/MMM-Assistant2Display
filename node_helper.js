/** node helper **/

const proxy = require("./components/proxy.js")
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
      case "PROXY_OPEN":
        this.openProxy(payload)
        break
      case "PROXY_CLOSE":
        this.closeProxy()
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
    }
  },

  initialize: function(config) {
    this.config = config
    this.proxyServer = null
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    if (this.config.useA2D) {
      this.addons()
      log("Initialized: Assistant2Display Version",  require('./package.json').version)
    }
    else log("Disabled.")
  },

  callback: function(send,params) {
    if (send) this.sendSocketNotification(send,params)
    //log("Socket callback: " + send,params ? params : "")
  },

  openProxy: function(url) {
    if (this.proxyServer) this.proxyServer.stop()
    this.config.links.debug = this.config.debug
    this.proxyServer = new proxy(this.config.links, (send,params)=>{ this.callback(send,params) })
    this.proxyServer.start(url)
  },

  closeProxy: function () {
    if (!this.proxyServer) return
    this.proxyServer.stop()
    this.proxyServer= null
  },

  setVolume: function(level) {
    var script = this.config.volumeScript.replace("#VOLUME#", level)
    exec (script, (err, stdout, stderr)=> {
      if (err) console.log("[A2D:VOLUME] Set Volume Error:", err)
      else log("[VOLUME] Set Volume To:", level)
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
  },
});
