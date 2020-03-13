/** node helper **/

const proxy = require("./components/proxy.js")
var exec = require('child_process').exec
var NodeHelper = require("node_helper")

var _log = function() {
  var context = "[AMK2:ADDONS:A2D]"
  return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

module.exports = NodeHelper.create({

  start: function () {
    this.config = {}
    this.proxyServer = null
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
    }
  },

  initialize: function(config) {
    this.config = config
    log(this.config)
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    if (this.config.useA2D) log("Initialized: Assistant2Display Version",  require('./package.json').version)
    else log("Disabled.")
  },

  callback: function(send,params) {
    if (send) this.sendSocketNotification(send,params)
  },

  openProxy: function(url) {
    if (this.proxyServer) this.proxyServer.stop()
    this.proxyServer = new proxy(this.config, (send,params)=>{ this.callback(send,params) })
    this.proxyServer.start(url)
  },

  closeProxy: function () {
    if (!this.proxyServer) return
    this.proxyServer.stop()
    this.proxyServer= null
  },

  setVolume: function(volume) {
    var script = this.config.volumeScript.replace("#VOLUME#", volume)
    exec (script, (err, stdout, stderr)=>{
      if (err) {
        console.log("[AMK2:ADDONS:A2D] Set Volume Error:", err)
      } else {
        log("Set Volume To:", volume)
      }
    })
  }
});
