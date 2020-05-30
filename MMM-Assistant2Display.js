/** Assistant 2 Display **/
/** @bugsounet **/

var A2D_ = function() {
  var context = "[A2D]";
  return Function.prototype.bind.call(console.log, console, context);
}()

var A2D = function() {
  //do nothing
}

Module.register("MMM-Assistant2Display",{
  defaults: {
    debug: false,
    useYoutube: true,
    links: {
      useLinks: false,
      displayDelay: 60 * 1000,
      scrollActivate: false,
      scrollStep: 25,
      scrollInterval: 1000,
      scrollStart: 5000
    },
    photos: {
      usePhotos: false,
      displayDelay: 10 * 1000,
    },
    volume: {
      useVolume: false,
      volumePreset: "ALSA"
    },
    briefToday: {
      useBriefToday: false,
      welcome: "brief Today"
    },
    screen: {
      useScreen: false,
      delay: 5 * 60 * 1000,
      turnOffDisplay: true,
      ecoMode: true,
      displayCounter: true,
      text: "Auto Turn Off Screen:",
      detectorSleeping: false,
      governorSleeping: false,
      rpi4: false
    },
    pir: {
      usePir: false,
      gpio: 21,
      reverseValue: false
    },
    governor: {
      useGovernor: false,
      sleeping: "powersave",
      working: "ondemand"
    },
    internet: {
      useInternet: false,
      displayPing: false,
      delay: 2* 60 * 1000,
      scan: "google.fr",
      command: "pm2 restart 0",
      showAlert: true
    },
    TelegramBot: {
      useTelecastSound: false,
      TelecastSound: "TelegramBot.ogg"
    },
    cast: {
      useCast: false,
      castName: "MagicMirror_A2D",
      port: 8569
    },
    spotify: {
      useSpotify: false,
      connectTo: null,
      playDelay: 3000,
      minVolume: 10,
      maxVolume: 100
    }
  },

  start: function () {
    this.config = this.configAssignment({}, this.defaults, this.config)
    this.volumeScript= {
      "OSX": `osascript -e 'set volume output volume #VOLUME#'`,
      "ALSA": `amixer sset -M 'PCM' #VOLUME#%`,
      "HIFIBERRY-DAC": `amixer sset -M 'Digital' #VOLUME#%`,
      "PULSE": `amixer set Master #VOLUME#% -q`,
      "RESPEAKER_SPEAKER": `amixer -M sset Speaker #VOLUME#%`,
      "RESPEAKER_PLAYBACK": `amixer -M sset Playback #VOLUME#%`
    }

    if(!this.config.disclaimerformeandjustformesodontuseit) this.useA2D = false

    this.helperConfig= {
      debug: this.config.debug,
      volumeScript: this.volumeScript[this.config.volume.volumePreset],
      useA2D: this.useA2D,
      links: this.config.links,
      screen: this.config.screen,
      pir: this.config.pir,
      governor: this.config.governor,
      internet: this.config.internet,
      cast: this.config.cast,
      disclaimer: this.config.disclaimerformeandjustformesodontuseit
    }

    this.radioPlayer = {
      play: false,
      img: null,
      link: null,
    }
    this.radio = new Audio()

    this.radio.addEventListener("ended", ()=> {
      A2D("Radio ended")
      this.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("pause", ()=> {
      A2D("Radio paused")
      this.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("abort", ()=> {
      A2D("Radio aborted")
      this.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("error", (err)=> {
      A2D("Radio error: " + err)
      this.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("loadstart", ()=> {
      A2D("Radio started")
      this.radioPlayer.play = true
      this.radio.volume = 0.6
      this.showRadio()
    })

    if (this.config.debug) A2D = A2D_
    var callbacks= {
      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      "sendNotification": (noti, params)=> {
        this.sendNotification(noti, params)
      },
      "radioStop": ()=> this.radio.pause()
    }
    this.displayResponse = new Display(this.config, callbacks)
    this.A2D = this.displayResponse.A2D
    if (this.useA2D) console.log("[A2D] initialized.")
  },

  getDom: function () {
    var dom = document.createElement("div")
    dom.id = "A2D_DISPLAY"

    var screen = document.createElement("div")
    screen.id = "SCREEN"
    if (!this.config.screen.useScreen || !this.config.screen.displayCounter) screen.className = "hidden"
    var screenText = document.createElement("div")
    screenText.id = "SCREEN_TEXT"
    screenText.textContent = this.config.screen.text
    screen.appendChild(screenText)
    var screenCounter = document.createElement("div")
    screenCounter.id = "SCREEN_COUNTER"
    screenCounter.classList.add("counter")
    screenCounter.textContent = "--:--:--"
    screen.appendChild(screenCounter)

    var internet = document.createElement("div")
    internet.id = "INTERNET"
    if (!this.config.internet.useInternet || !this.config.internet.displayPing) internet.className = "hidden"
    var internetText = document.createElement("div")
    internetText.id = "INTERNET_TEXT"
    internetText.textContent = "Ping: "
    internet.appendChild(internetText)
    var internetPing = document.createElement("div")
    internetPing.id = "INTERNET_PING"
    internetPing.classList.add("ping")
    internetPing.textContent = "Loading ..."
    internet.appendChild(internetPing)

    var radio = document.createElement("div")
    radio.id = "RADIO"
    radio.className = "hidden"
    var radioImg = document.createElement("img")
    radioImg.id = "RADIO_IMG"
    radio.appendChild(radioImg)

    dom.appendChild(radio)
    dom.appendChild(screen)
    dom.appendChild(internet)
    return dom
  },

  getScripts: function() {
    this.scanConfig()
    var ui = this.ui + "/" + this.ui + '.js'
    return [
       "/modules/MMM-Assistant2Display/components/display.js",
       "/modules/MMM-Assistant2Display/ui/" + ui,
       "/modules/MMM-Assistant2Display/components/youtube.js"
    ]
  },

  getStyles: function() {
    return [
      "/modules/MMM-Assistant2Display/ui/" + this.ui + "/" + this.ui + ".css",
      "screen.css"
    ]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json"
    }
  },

  notificationReceived: function (notification, payload) {
    if (notification == "DOM_OBJECTS_CREATED") {
      this.sendSocketNotification("INIT", this.helperConfig)
    }
    if (this.useA2D) {
      this.A2D = this.displayResponse.A2D
      switch(notification) {
        case "DOM_OBJECTS_CREATED":
          this.displayResponse.prepare()
          break
        case "ASSISTANT_READY":
          this.onReady()
          break
        case "ASSISTANT_LISTEN":
        case "ASSISTANT_THINK":
          this.A2D.speak = true
          if (this.config.useYoutube && this.displayResponse.player) {
            this.displayResponse.player.command("setVolume", 5)
          }
          if (this.config.spotify.useSpotify && this.A2D.spotify.playing) this.sendNotification("SPOTIFY_VOLUME", this.config.spotify.minVolume)
          if (this.A2D.radio) this.radio.volume = 0.1
          if (this.A2D.locked) this.displayResponse.hideDisplay()
          break
        case "ASSISTANT_STANDBY":
          this.A2D.speak = false
          if (this.config.useYoutube && this.displayResponse.player) {
            this.displayResponse.player.command("setVolume", 100)
          }
          if (this.config.spotify.useSpotify) this.sendNotification("SPOTIFY_VOLUME", this.config.spotify.maxVolume)
          if (this.A2D.radio) this.radio.volume = 0.6
          if (this.displayResponse.working()) this.displayResponse.showDisplay()
          else this.displayResponse.hideDisplay()
          break
        case "A2D":
          this.displayResponse.start(payload)
          this.sendNotification("TV-STOP") // Stop MMM-FreeboxTV
          break
        case "A2D_STOP":
          if (this.A2D.locked) {
            if (this.A2D.youtube.displayed) {
              this.displayResponse.player.command("stopVideo")
            }
            if (this.A2D.photos.displayed) {
              this.displayResponse.resetPhotos()
              this.displayResponse.hideDisplay()
            }
            if (this.A2D.links.displayed) {
              this.displayResponse.resetLinks()
              this.displayResponse.hideDisplay()
            }
          }
          if (this.A2D.spotify.playing) this.sendNotification("SPOTIFY_PAUSE")
          if (this.A2D.radio) this.radio.pause()
          this.sendNotification("TV-STOP") // Stop MMM-FreeboxTV
          break
        case "A2D_ASSISTANT_BUSY":
          if (this.config.screen.useScreen && !this.A2D.locked) this.sendSocketNotification("SCREEN_STOP")
          break
        case "A2D_ASSISTANT_READY":
          if (this.config.screen.useScreen && !this.A2D.locked) this.sendSocketNotification("SCREEN_RESET")
          break
        case "VOLUME_SET":
          if (this.config.volume.useVolume) {
            this.sendSocketNotification("SET_VOLUME", payload)
          }
          break
        case "WAKEUP": /** for external wakeup **/
          if (this.config.screen.useScreen) {
            this.sendSocketNotification("SCREEN_WAKEUP")
          }
          break
        case "A2D_LOCK": /** screen lock **/
          if (this.config.screen.useScreen) {
            this.sendSocketNotification("SCREEN_LOCK", true)
          }
          break
        case "A2D_UNLOCK": /** screen unlock **/
          if (this.config.screen.useScreen) {
            this.sendSocketNotification("SCREEN_LOCK", false)
          }
          break
        case "A2D_RADIO":
          if (this.A2D.youtube.displayed) this.displayResponse.player.command("stopVideo")
          if (payload.link) {
            if (payload.img) {
              var radioImg = document.getElementById("RADIO_IMG")
              this.radioPlayer.img = payload.img
              radioImg.src = this.radioPlayer.img
            }
            this.radioPlayer.link = payload.link
            this.radio.src = this.radioPlayer.link
            this.radio.autoplay = true
          }
          break
        case "TELBOT_TELECAST":
          if (this.config.TelegramBot.useTelecastSound) {
            this.radioPlayer.link = "modules/MMM-Assistant2Display/components/" + this.config.TelegramBot.TelecastSound
            this.radio.src = this.radioPlayer.link
            this.radio.autoplay = true
          }
          break
        case "SPOTIFY_UPDATE_PLAYING":
          if (this.config.spotify.useSpotify) {
            this.A2D.spotify.playing = payload ? true : false
            if (this.config.screen.useScreen && !this.displayResponse.working()) {
              if (payload) this.sendSocketNotification("SCREEN_WAKEUP")
              this.sendSocketNotification("SCREEN_LOCK", payload ? true : false)
            }
          }
          break
        case "SPOTIFY_CONNECTED":
          if (this.config.spotify.useSpotify) this.A2D.spotify.connected = true
          break
        case "SPOTIFY_DISCONNECTED":
          if (this.config.spotify.useSpotify) this.A2D.spotify.connected = false
          break
      }
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "SCREEN_SHOWING":
        this.screenShowing()
        break
      case "SCREEN_HIDING":
        this.screenHiding()
        break
      case "SCREEN_TIMER":
        var counter = document.getElementById("SCREEN_COUNTER")
        counter.textContent = payload
        break
      case "INTERNET_DOWN":
        this.sendNotification("SHOW_ALERT", {
          type: "alert" ,
          message: "Internet is DOWN ! Retry: " + payload,
          title: "Internet Scan",
          timer: 10000
        })
        this.sendSocketNotification("SCREEN_WAKEUP")
        break
      case "INTERNET_RESTART":
        this.sendNotification("SHOW_ALERT", {
          type: "alert" ,
          message: "Internet is now available! Restarting Magic Mirror...",
          title: "Internet Scan",
          timer: 10000
        })
        this.sendSocketNotification("SCREEN_WAKEUP")
        break
      case "INTERNET_PING":
        var ping = document.getElementById("INTERNET_PING")
        ping.textContent = payload
        break
      case "SNOWBOY_STOP":
        this.sendNotification("ASSISTANT_STOP")
        break
      case "SNWOBOY_START":
        this.sendNotification("ASSISTANT_START")
        break
      case "CAST_START":
        this.displayResponse.castStart(payload)
        break
      case "CAST_STOP":
        this.displayResponse.castStop()
        break
    }
  },

  scanConfig: function() {
    this.useA2D = false
    this.ui = "Windows"
    console.log("[A2D] Scan config.js file")
    var GAFound = false
    for (let [item, value] of Object.entries(config.modules)) {
      if (value.module == "MMM-GoogleAssistant") {
        GAFound = true
        if (value.position == "fullscreen_above") this.ui = "Fullscreen"
        this.useA2D = (value.config.A2DServer && value.config.A2DServer.useA2D && !value.disabled) ? value.config.A2DServer.useA2D : false
      }
    }
    if (!GAFound) console.log("[A2D][ERROR] GoogleAssistant not found!")
    console.log("[A2D] Auto choice UI:", this.ui)
    if (!this.useA2D) {
      console.log("[A2D][ERROR] A2D is desactived!")
    }
  },

  configAssignment : function (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.configAssignment({}, result[key], item[key])
            } else {
              result[key] = item[key]
            }
          } else {
            result[key] = item[key]
          }
        }
      }
    }
    return result
  },

  /** briefToday **/
  briefToday: function() {
    this.sendNotification("ASSISTANT_WELCOME", { key: this.config.briefToday.welcome })
  },

  onReady: function() {
    if (this.config.briefToday.useBriefToday) this.briefToday()
  },

  screenShowing: function () {
    MM.getModules().enumerate((module)=> {
      module.show(1000, {lockString: "A2D_SCREEN"})
    })
  },

  screenHiding: function () {
    MM.getModules().enumerate((module)=> {
      module.hide(1000, {lockString: "A2D_SCREEN"})
    })
  },

  showRadio: function() {
    this.A2D = this.displayResponse.A2D
    this.A2D.radio = this.radioPlayer.play
    if (this.radioPlayer.img) {
      var radio = document.getElementById("RADIO")
      if (this.radioPlayer.play) radio.classList.remove("hidden")
      else radio.classList.add("hidden")
    }
  },

  /** TelegramBot commands **/
  getCommands: function(commander) {
    commander.add({
      command: "restart",
      description: this.translate("RESTART_HELP"),
      callback: "tbRestart"
    })
    if (this.config.screen.useScreen) {
      commander.add({
        command: "wakeup",
        description: this.translate("WAKEUP_HELP"),
        callback: "tbWakeup"
      })
    }
    commander.add({
      command: "hide",
      description: this.translate("HIDE_HELP"),
      callback: "tbHide"
    })
    commander.add({
      command: "show",
      description: this.translate("SHOW_HELP"),
      callback: "tbShow"
    })
    commander.add({
      command: "stop",
      description: this.translate("STOP_HELP"),
      callback: "tbStopA2D"
    })
    commander.add({
      command: "A2D",
      description: this.translate("A2D_HELP"),
      callback: "tbA2D"
    })
    if (this.config.volume.useVolume) {
      commander.add({
        command: "volume",
        description: this.translate("VOLUME_HELP"),
        callback: "tbVolume"
      })
    }
  },

  tbRestart: function(command, handler) {
    if (handler.args) {
      this.sendSocketNotification("RESTART", handler.args)
      handler.reply("TEXT", this.translate("RESTART_DONE"))
    } else handler.reply("TEXT", this.translate("RESTART_ERROR"))
  },

  tbWakeup: function(command, handler) {
    this.sendSocketNotification("SCREEN_WAKEUP")
    handler.reply("TEXT", this.translate("WAKEUP_REPLY"))
  },

  tbHide: function(command, handler) {
    var found = false
    var unlock = false
    if (handler.args) {
      if ((handler.args == "MMM-GoogleAssistant") || (handler.args == "MMM-Assistant2Display")) {
        return handler.reply("TEXT", this.translate("DADDY"))
      }
      MM.getModules().enumerate((m)=> {
        if (m.name == handler.args) {
          found = true
          if (m.hidden) return handler.reply("TEXT", handler.args + this.translate("HIDE_ALREADY"))
          if (m.lockStrings.length > 0) {
            m.lockStrings.forEach( lock => {
              if (lock == "TB_A2D") {
                m.hide(500, {lockString: "TB_A2D"})
                if (m.lockStrings.length == 0) {
                  unlock = true
                  handler.reply("TEXT", handler.args + this.translate("HIDE_DONE"))
                }
              }
            })
            if (!unlock) return handler.reply("TEXT", handler.args + this.translate("HIDE_LOCKED"))
          }
          else {
            m.hide(500, {lockString: "TB_A2D"})
            handler.reply("TEXT", handler.args + this.translate("HIDE_DONE"))
          }
        }
      })
      if (!found) handler.reply("TEXT", this.translate("MODULE_NOTFOUND") + handler.args)
    } else return handler.reply("TEXT", this.translate("MODULE_NAME"))
  },

  tbShow: function(command, handler) {
    var found = false
    var unlock = false
    if (handler.args) {
      MM.getModules().enumerate((m)=> {
        if (m.name == handler.args) {
          found = true
          if (!m.hidden) return handler.reply("TEXT", handler.args + this.translate("SHOW_ALREADY"))
          if (m.lockStrings.length > 0) {
            m.lockStrings.forEach( lock => {
              if (lock == "TB_A2D") {
                m.show(500, {lockString: "TB_A2D"})
                if (m.lockStrings.length == 0) {
                  unlock = true
                  handler.reply("TEXT", handler.args + this.translate("SHOW_DONE"))
                }
              }
            })
            if (!unlock) return handler.reply("TEXT", handler.args + this.translate("SHOW_LOCKED"))
          }
          else {
            m.show(500, {lockString: "TB_A2D"})
            handler.reply("TEXT", handler.args + this.translate("SHOW_DONE"))
          }
        }
      })
      if (!found) handler.reply("TEXT", this.translate("MODULE_NOTFOUND") + handler.args)
    } else return handler.reply("TEXT", this.translate("MODULE_NAME"))
  },

  tbStopA2D: function(command, handler) {
    this.notificationReceived("A2D_STOP")
    handler.reply("TEXT", this.translate("STOP_A2D"))
  },

  tbA2D: function (command, handler) {
    if (handler.args) {
      var responseEmulate = {
        "photos": [],
        "urls": [],
        "transcription": {},
        "trysay": null,
        "help": null
      }
      var regexp = /^((http(s)?):\/\/)(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
      var isLink = regexp.test(handler.args)
      var retryWithHttp = regexp.test("http://" + handler.args)
      if (isLink || retryWithHttp) {
        handler.reply("TEXT", this.translate("A2D_OPEN") + handler.args)
        console.log(handler)
        responseEmulate.transcription.transcription = " Telegram @"+ handler.message.from.username + ": " + handler.args
        responseEmulate.transcription.done = true
        responseEmulate.urls[0] = isLink ? handler.args : ("http://" + handler.args)
        this.displayResponse.start(responseEmulate)
      }
      else handler.reply("TEXT", this.translate("A2D_INVALID"))
    }
    else handler.reply("TEXT", "/A2D <link>")
  },

  tbVolume: function(command, handler) {
    if (handler.args) {
      var value = Number(handler.args)
      if ((!value && value != 0) || ((value < 0) || (value > 100))) return handler.reply("TEXT", "/volume [0-100]")
      this.sendSocketNotification("SET_VOLUME", value)
      handler.reply("TEXT", "Volume " + value+"%")
    }
    else handler.reply("TEXT", "/volume [0-100]")
  }
});
