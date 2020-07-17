/** node helper **/

var exec = require('child_process').exec
const { spawn } = require('child_process')
const process = require('process')
const fs = require("fs")
const path = require("path")
var NodeHelper = require("node_helper")
const MD5 = require("@bugsounet/md5")
const Screen = require("@bugsounet/screen")
const Pir = require("@bugsounet/pir")
const Governor = require("@bugsounet/governor")
const Internet = require("@bugsounet/internet")
const CastServer = require("@bugsounet/cast")
const Spotify = require("@bugsounet/spotify")
const pm2 = require('pm2')

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
    timeout = null
    retry = null
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[A2D] MMM-Assistant2Display Version:", require('./package.json').version)
        new MD5(payload, () => { this.initialize(payload) })
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
      case "SPOTIFY_RETRY_PLAY":
        clearTimeout(timeout)
        timeout= null
        clearTimeout(retry)
        retry = null
        retry = setTimeout(() => {
          this.spotify.play(payload, (code, error, result) => {
            if ((code == 404) && (result.error.reason == "NO_ACTIVE_DEVICE")) {
              if (this.config.spotify.useIntegred) {
                log("[SPOTIFY] RETRY playing...")
                this.socketNotificationReceived("SPOTIFY_PLAY", payload)
              }
            }
            if ((code !== 204) && (code !== 202)) {
              return console.log("[SPOTIFY:PLAY] RETRY Error", code, error, result)
            }
            else log("[SPOTIFY] RETRY: DONE_PLAY")
          })
        }, 3000)
        break
      case "SPOTIFY_PLAY":
        this.spotify.play(payload, (code, error, result) => {
          clearTimeout(timeout)
          timeout= null
          if ((code == 404) && (result.error.reason == "NO_ACTIVE_DEVICE")) {
            if (this.config.spotify.useLibrespot) {
              console.log("[SPOTIFY] No response from librespot !")
              pm2.restart("librespot")
              timeout= setTimeout(() => {
                this.socketNotificationReceived("SPOTIFY_TRANSFER", this.config.spotify.connectTo)
                this.socketNotificationReceived("SPOTIFY_RETRY_PLAY", payload)
              }, 3000)
            }
          }
          if ((code !== 204) && (code !== 202)) {
            return console.log("[SPOTIFY:PLAY] Error", code, error, result)
          }
          else log("[SPOTIFY] DONE_PLAY")
        })
        break
      case "SPOTIFY_VOLUME":
        this.spotify.volume(payload, (code, error, result) => {
          if (code !== 204) console.log("[SPOTIFY:VOLUME] Error", code, error, result)
          else log("[SPOTIFY] DONE_VOLUME")
        })
        break
      case "SPOTIFY_PAUSE":
        this.spotify.pause((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:PAUSE] Error", code, error, result)
          else log("[SPOTIFY] DONE_PAUSE")
        })
        break
      case "SPOTIFY_TRANSFER":
        this.spotify.transferByName(payload, (code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:TRANSFER] Error", code, error, result)
          else log("[SPOTIFY] DONE_TRANSFER")
        })
        break
      case "SPOTIFY_STOP":
        pm2.restart("librespot")
        break
    }
  },

  initialize: async function(config) {
    this.config = config
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    if (this.config.useA2D) {
      this.addons()
      console.log("[A2D] Assistant2Display is initialized.")
    }
    else console.log("[A2D] Assistant2Display is disabled.")
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
        //log("Addons Notification:", noti,params)
      },
      "screen": (param) => {
        if (this.screen && param == "WAKEUP") this.screen.wakeup()
      },
      "governor": (param) => {
        if (this.governor && param == "GOVERNOR_SLEEPING") this.governor.sleeping()
        if (this.governor && param == "GOVERNOR_WORKING") this.governor.working()
      },
      "pir": (param) => {
        if (this.screen && this.pir && param == "PIR_DETECTED") this.screen.wakeup()
      }
    }

    if (this.config.screen.useScreen) {
      this.screen = new Screen(this.config.screen, callbacks.sendSocketNotification, this.config.debug, callbacks.sendSocketNotification, callbacks.governor )
      this.screen.activate()
    }
    if (this.config.pir.usePir) {
      this.pir = new Pir(this.config.pir, callbacks.pir, this.config.debug)
      this.pir.start()
    }
    if (this.config.governor.useGovernor) {
      this.governor = new Governor(this.config.governor, null, this.config.debug)
      this.governor.start()
    }
    if (this.config.internet.useInternet) {
      this.internet = new Internet(this.config.internet, callbacks.sendSocketNotification, this.config.debug)
      this.internet.start()
    }
    if (this.config.cast.useCast) {
      this.cast = new CastServer(this.config.cast, callbacks.sendSocketNotification, this.config.debug)
      this.cast.start()
    }
    if (this.config.spotify.useSpotify) {
      if (this.config.spotify.useIntegred) {
        this.spotify = new Spotify(this.config.spotify, callbacks.sendSocketNotification, this.config.debug)
        this.spotify.start()
      }
      if (this.config.spotify.useLibrespot) {
        console.log("[SPOTIFY] Launch Librespot...")
        this.librespot()
      }
    }
  },

  /** launch librespot with pm2 **/
  librespot: function() {
    var file = "librespot"
    var filePath = path.resolve(__dirname, "components/librespot/target/release", file)
    if (!fs.existsSync(filePath)) return console.log("[LIBRESPOT] librespot is not installed !")
    pm2.connect((err) => {
      if (err) return console.log(err)
      console.log("[PM2] Connected!")
      pm2.list((err,list) => {
        if (err) return console.log(err)
        if (list && Object.keys(list).length > 0) {
          for (let [item, info] of Object.entries(list)) {
            if (info.name == "librespot" && info.pid) {
              return console.log("[PM2] Librespot already launched")
            }
          }
        }
        pm2.start({
          script: filePath,
          name: "librespot",
          out_file: "/dev/null",
          args: ["-n", this.config.spotify.connectTo, "-u", this.config.spotify.username, "-p", this.config.spotify.password , "--initial-volume" , this.config.spotify.maxVolume]
        }, (err, proc) => {
          if (err) return console.log(err)
          console.log("[PM2] Librespot started !")
        })
      })
    })
    process.on('exit', (code) => {
      // try to kill librespot on exit ... or not ...
      pm2.stop("librespot", (e,p) => {
        console.log("[LIBRESPOT] Killed")
      })
    })
  }
});
