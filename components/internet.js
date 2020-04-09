/** internet scan addon for A2D
 ** config: (external to internal)
 **   debug: debuging mode
 **   delay: delay for scan in ms
 **   scan: website or ip to scan
 **   command: command to execute when internet afresh available
 **   showAlert: display MagicMirror Alert (Alert module needed)
 ** ---
 ** return value: (internal)
 **   this.internet.status: true/false (internet alive)
 **   this.internet.ping: number in ms (ping)
 ** ---
 ** callback: (internal to addon-recipe [with-internet.js])
 **   INTERNET_DOWN: display alert internet down
 **   INTERNET_RESTART: display alert internet afresh available
 **
/** bugsounet **/

const exec = require('child_process').exec
const ping = require('ping')

var _log = function() {
    var context = "[A2D:INTERNET]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class INTERNET {
  constructor(config, callback) {
    this.config = config
    this.sendSocketNotification = callback.sendSocketNotification
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    this.default = {
      delay: 30 * 1000,
      scan: "google.fr",
      command: "pm2 restart 0",
      showAlert: true
    }
    this.config = Object.assign(this.default, this.config)
  }
  activate () {
    log("Initialize...")
    this.internet = {
      "status" : false,
      "ping" : null,
      "ticks": 0
    }
    this.interval = null
    this.start()
    log("Scan Starts.")
  }
  
  start () {
    this.counter = this.config.delay
    this.interval = setInterval(()=> {
      this.counter -= 1000;
      if (this.counter <= 0) {
        clearInterval(this.interval);
        this.interval = null
        this.internetStatus()
      }
    }, 1000);
  }
   
  internetStatus () {
    ping.promise.probe(this.config.scan).then( (res)=> {
      if (res.alive) {
        this.internet.status = true
        this.internet.ping = res.time
      } else {
        this.internet.status = false
        this.internet.ping = null
        this.internet.ticks +=1
      }
      this.needRestart()
    })
  }
    
  needRestart () {
    if (this.internet.status) {
      if (this.internet.ticks == 0) {
        this.sendSocketNotification("INTERNET_PING", this.internet.ping + " ms")
        this.start()
      } else {
       this.sendSocketNotification("INTERNET_PING", "Available")
       log("[ALERT] Internet is now AVAILABLE -- After " + this.internet.ticks + " retry")
       if (this.config.showAlert) this.sendSocketNotification("INTERNET_RESTART")
       this.internet.ticks = 0
       log("Execute your restart command in 5 secs")
       setTimeout (() => { 
         exec (this.config.command, (e,stdo,stde) => {
           if (e) log (e)
         })
       } , 5000 )
      }
    } else {
      log("[ALERT] Internet is DOWN -- Retry: " + this.internet.ticks)
      this.sendSocketNotification("INTERNET_PING", "Down")
      if (this.config.showAlert) this.sendSocketNotification("INTERNET_DOWN", this.internet.ticks)
      this.start()
    }
  }
}

module.exports = INTERNET
