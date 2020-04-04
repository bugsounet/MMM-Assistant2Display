/** Screen Plugin For A2D **/
/** bugsounet **/

const exec = require('child_process').exec
const process = require('process');

var _log = function() {
    var context = "[A2D:SCREEN]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class SCREEN {
  constructor(config, callback) {
    this.config = config
    this.sendSocketNotification = callback.sendSocketNotification
    this.governor = callback.governor
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    this.interval = null
    this.running = false
    this.locked = false
    this.powerDisplay = false
    this.default = {
      delay: 5 * 60 * 1000,
      turnOffDisplay: true,
      ecoMode: true,
      displayCounter: true,
      detectorSleeping: false,
      governorSleeping: false,
      rpi4: false,
      dev: false
    }
    this.config = Object.assign(this.default, this.config)
  }
  activate () {
    if (!this.config.turnOffDisplay && !this.config.ecoMode) return log("Disabled.")
    process.on('beforeExit', (code) => {
      log('Thanks for using this addon')
    });

    process.on('exit', (code) => {
      if (this.config.turnOffDisplay) this.setPowerDisplay(true)
      if (this.config.governorSleeping) this.governor("WORKING")
      log('ByeBye !')
      log('@bugsounet')
    });
    log("Initialized...")
    this.start()
  }

  start (restart) {
    if (this.locked || this.running || (!this.config.turnOffDisplay && !this.config.ecoMode)) return
    if (!restart) log("Start.")
    else log("Restart.")
    if (!this.powerDisplay) {
      if (this.config.turnOffDisplay) {
        if (this.config.dev) this.setPowerDisplay(true)
        else this.wantedPowerDisplay(true)
      }
      if (this.config.ecoMode) {
        this.sendSocketNotification("SCREEN_SHOWING")
        this.powerDisplay = true
      }
      if (this.config.governorSleeping) this.governor("WORKING")
    }
    clearInterval(this.interval)
    this.interval = null
    this.counter = this.config.delay
    this.interval = setInterval( ()=> {
      this.running = true
      this.counter -= 1000
      if (this.config.displayCounter) {
        this.sendSocketNotification("SCREEN_TIMER", new Date(this.counter).toUTCString().match(/\d{2}:\d{2}:\d{2}/)[0])
        if (this.config.dev) log("Counter:", new Date(this.counter).toUTCString().match(/\d{2}:\d{2}:\d{2}/)[0])
      }
      if (this.counter <= 0) {
        clearInterval(this.interval)
        this.running = false
        if (this.powerDisplay) {
          if (this.config.ecoMode) {
            this.sendSocketNotification("SCREEN_HIDING")
            this.powerDisplay = false
          }
          if (this.config.turnOffDisplay) this.wantedPowerDisplay(false)
        }
        this.interval = null
        if (this.config.detectorSleeping) this.sendSocketNotification("SNOWBOY_STOP")
        if (this.config.governorSleeping && this.config.ecoMode) this.governor("SLEEPING")
        log("Stops by counter.")
      }
    }, 1000)
  }

  stop () {
    if (this.locked) return log("want to stop but locked")

    if (!this.powerDisplay) {
      if (this.config.governorSleeping) this.governor("WORKING")
      if (this.config.turnOffDisplay) this.wantedPowerDisplay(true)
      if (this.config.ecoMode) {
        this.sendSocketNotification("SCREEN_SHOWING")
        this.powerDisplay = true
      }
    }
    if (!this.running) return
    clearInterval(this.interval)
    this.interval = null
    this.running = false
    log("Stops.", (this.locked ? "(Locked)" : ""))
  }

  reset() {
    if (this.locked) return log("want reset but locked")
    clearInterval(this.interval)
    this.interval = null
    this.running = false
    this.start(true)
  }

  wakeup() {
    if (this.locked) return log("want wakeup but locked")
    if (!this.powerDisplay) {
      if (this.config.governorSleeping) this.governor("WORKING")
      if (this.config.detectorSleeping) this.sendSocketNotification("SNOWBOY_START")
    }
    this.reset()
  }

  lock() {
    if (this.locked) return log("Already locked")
    this.locked = true
    clearInterval(this.interval)
    this.interval = null
    this.running = false
    log("Locked !")
  }

  unlock() {
    log("Unlocked !")
    this.locked=false
    this.reset()
  }

  wantedPowerDisplay (wanted) {
    if (this.config.rpi4) {
      var actual = false
      exec("DISPLAY=:0 xset q | grep Monitor", (err, stdout, stderr)=> {
        if (err == null) {
          let responseSh = stdout.trim()
          var displaySh = responseSh.split(" ")[2]
          if (displaySh == "On") actual = true
          this.resultDisplay(actual,wanted)
        }
        else log("[Display Error] " + err)
      })
    } else {
      exec("/usr/bin/vcgencmd display_power", (err, stdout, stderr)=> {
        if (err == null) {
          var displaySh = stdout.trim()
          var actual = Boolean(Number(displaySh.substr(displaySh.length -1)))
          this.resultDisplay(actual,wanted)
        }
        else log("[Display Error] " + err)
      })
    }
  }

  resultDisplay (actual,wanted) {
    log("Display -- Actual: " + actual + " - Wanted: " + wanted)
    if (actual && !wanted) this.setPowerDisplay(false)
    if (!actual && wanted) this.setPowerDisplay(true)
  }

  setPowerDisplay (set) {
    if (this.config.rpi4) {
      if (set) exec("DISPLAY=:0 xset dpms force on")
      else exec("DISPLAY=:0 xset dpms force off")
    } else {
      if (set) exec("/usr/bin/vcgencmd display_power 1")
      else exec("/usr/bin/vcgencmd display_power 0")
    }
    log("Display " + (set ? "ON." : "OFF."))
    this.powerDisplay = set
  }
}

module.exports = SCREEN
