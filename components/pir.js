/** PIR addon For A2D **/
/** bugsounet **/

const exec = require('child_process').exec
const Gpio = require('onoff').Gpio

var _log = function() {
    var context = "[A2D:PIR]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class PIR {
  constructor(config, callback) {
    this.config = config
    this.screen = callback.screen
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    this.default = {
      pin: 21,
      reverseValue: false
    }
    this.config = Object.assign(this.default, this.config)
  }
  activate () {
    log(this.default.version + " Starts.")
    this.pir = new Gpio(this.config.pin, 'in', 'both')
    this.pir.watch( (err, value)=> {
      if (err) return log("[Error]", err)
      log("Sensor read value: " + value)
      if ((value == 1 && !this.config.reverseValue) || (value == 0 && this.config.reverseValue)) {
        this.screen("WAKEUP")
        log("Sended WAKEUP in Sensor value:", value)
      }
    })
  }
}

module.exports = PIR
