/** Snowboy addon For A2D **/
/** bugsounet **/

const path = require("path")
const Detector = require("../snowboy/lib/node/index.js").Detector
const Models = require("../snowboy/lib/node/index.js").Models
const Recorder = require("../components/lpcm16.js")

var snowboyDict = {
  "smart_mirror": {
    hotwords: "smart_mirror",
    file: "smart_mirror.umdl",
    sensitivity: "0.5",
  },
  "computer": {
    hotwords: "computer",
    file: "computer.umdl",
    sensitivity: "0.6",
  },
  "snowboy": {
    hotwords: "snowboy",
    file: "snowboy.umdl",
    sensitivity: "0.5",
  },
  "jarvis": {
    hotwords: ["jarvis", "jarvis"],
    file: "jarvis.umdl",
    sensitivity: "0.7,0.7",
  },
  "subex": {
    hotwords: "subex",
    file: "subex.umdl",
    sensitivity: "0.6",
  },
  "neo_ya": {
    hotwords: ["neo_ya", "neo_ya"],
    file: "neoya.umdl",
    sensitivity: "0.7,0.7",
  },
  "hey_extreme": {
    hotwords: "hey_extreme",
    file: "hey_extreme.umdl",
    sensitivity: "0.6",
  },
  "view_glass": {
    hotwords: "view_glass",
    file: "view_glass.umdl",
    sensitivity: "0.7",
  }
}

var _log = function() {
    var context = "[A2D:SNOWBOY]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class SNOWBOY {
  constructor(config, mic, callback) {
    this.micConfig = mic
    this.config = config
    this.sendSocketNotification = callback.sendSocketNotification
    this.models = []
    this.model = []
    this.mic = null
    this.detector = null
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    this.default = {
      audioGain: 2.0,
      Frontend: false,
      Model: "smart_mirror",
      Sensitivity: null
    }
    this.config = Object.assign(this.default, this.config)
  }

  init () {
    this.models = new Models();
    var modelPath = path.resolve(__dirname, "../models")

    log("Checking models")
    if (this.config.Model) {
      for (let [item, value] of Object.entries(snowboyDict)) {
        if (this.config.Model == item) {
          log("Model selected:", item)
          if (this.config.Sensitivity) {
             if ((isNaN(this.config.Sensitivity)) || (Math.ceil(this.config.Sensitivity) > 1)) {
               log("Wrong Sensitivity value.")
             } else {
              if (item == ("jarvis" || "neo_ya")) {
                value.sensitivity = this.config.Sensitivity + "," + this.config.Sensitivity
              }
              else value.sensitivity = this.config.Sensitivity
              log("Sensitivity set:", this.config.Sensitivity)
            }
          }
          this.model.push(value)
        }
      }
    }
    if (this.model.length == 0) return console.log("[A2D:SNOWBOY][ERROR] model not found:", this.config.Model)
    this.model[0].file = path.resolve(modelPath, this.config.Model + ".umdl")
    this.models.add(this.model[0])

    log("Initialized...")
    this.start()
  }

  start () {
    if (this.mic) return
    this.mic = null
    var defaultOption = {
      sampleRate: 16000,
      channels: 1,
      threshold: 0.5,
      thresholdStart: null,
      thresholdEnd: null,
      silence: '1.0',
      verbose: this.debug
    }
    var Options = Object.assign({}, defaultOption, this.micConfig)

    this.detector = new Detector({
      resource: path.resolve(__dirname, "../snowboy/resources/common.res"),
      models: this.models,
      audioGain: this.config.audioGain,
      applyFrontend: this.config.Frontend
    })

    this.detector
      .on("error", (err)=>{
        log("Detector Error:", err)
        this.stop()
        return
      })
      .on("hotword", (index, hotword, buffer)=>{
        log("Detected:", hotword)
        this.stop()
        this.sendSocketNotification("SNOWBOY_DETECTED")
        return
      })

    this.mic = new Recorder(Options, this.detector, (err)=>{this.callbackErr(err)})
    this.mic.start()
  }

  stop () {
    if (!this.mic) return
    this.mic.stop()
    this.mic = null
    this.detector = null
  }

  callbackErr (err) {
    if (err) {
     console.log("[A2D:SNOWBOY][ERROR] " + err)
     this.stop()
     return
    }
  }
}

module.exports = SNOWBOY
