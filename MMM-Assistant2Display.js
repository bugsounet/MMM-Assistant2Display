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
      volumePreset: "ALSA",
      myScript: null,
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
      displayBar: true,
      displayStyle: "Text",
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
      useIntegred: false, //!!!DEV!!!
      useLibrespot: false, //!!!DEV!!! (not yet implented)
      connectTo: null,
      playDelay: 3000,
      minVolume: 10,
      maxVolume: 100,
      updateInterval: 1000, //!!!DEV!!!
      idleInterval: 10000, //!!!DEV!!!
      PATH: "../../../", // Needed Don't modify it !
      TOKEN: "./token.json", //!!!DEV!!!
      CLIENT_ID: "", //!!!DEV!!!
      CLIENT_SECRET: "", //!!!DEV!!!
      deviceDisplay: "Listening on", //!!!DEV!!!
    }
  },

  start: function () {
    this.config = this.configAssignment({}, this.defaults, this.config)
    this.volumeScript= {
      "OSX": "osascript -e 'set volume output volume #VOLUME#'",
      "ALSA": "amixer sset -M 'PCM' #VOLUME#%",
      "ALSA_HEADPHONE": "amixer sset -M 'Headphone' #VOLUME#%",
      "ALSA_HDMI": "amixer sset -M 'HDMI' #VOLUME#%",
      "HIFIBERRY-DAC": "amixer sset -M 'Digital' #VOLUME#%",
      "PULSE": "amixer set Master #VOLUME#% -q",
      "RESPEAKER_SPEAKER": "amixer -M sset Speaker #VOLUME#%",
      "RESPEAKER_PLAYBACK": "amixer -M sset Playback #VOLUME#%"
    }

    this.helperConfig= {
      debug: this.config.debug,
      volumeScript: this.config.volume.myScript ? this.config.volume.myScript : this.volumeScript[this.config.volume.volumePreset],
      useA2D: this.useA2D,
      links: this.config.links,
      screen: this.config.screen,
      pir: this.config.pir,
      governor: this.config.governor,
      internet: this.config.internet,
      cast: this.config.cast,
      spotify: this.config.spotify
    }

    this.radioPlayer = {
      play: false,
      img: null,
      link: null,
    }
    this.createRadio()

    if (this.config.debug) A2D = A2D_
    var callbacks= {
      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      "sendNotification": (noti, params)=> {
        this.sendNotification(noti, params)
      },
      "radioStop": ()=> this.radio.pause(),
      "spotify": (params) => this.A2D.spotify.connected = params
    }
    this.displayResponse = new Display(this.config, callbacks)
    if (this.config.spotify.useSpotify && this.config.spotify.useIntegred) this.spotify = new Spotify(this.config.spotify, callbacks, this.config.debug)
    this.A2D = this.displayResponse.A2D

    this.bar= null
    this.checkStyle()
    if (this.useA2D) console.log("[A2D] initialized.")
  },

  getDom: function () {
    var dom = document.createElement("div")
    dom.id = "A2D_DISPLAY"

    /** Screen TimeOut Text **/
    var screen = document.createElement("div")
    screen.id = "A2D_SCREEN"
    if (!this.config.screen.useScreen || (this.config.screen.displayStyle != "Text")) screen.className = "hidden"
    var screenText = document.createElement("div")
    screenText.id = "A2D_SCREEN_TEXT"
    screenText.textContent = this.config.screen.text
    screen.appendChild(screenText)
    var screenCounter = document.createElement("div")
    screenCounter.id = "A2D_SCREEN_COUNTER"
    screenCounter.classList.add("counter")
    screenCounter.textContent = "--:--"
    screen.appendChild(screenCounter)

    /** Screen TimeOut Bar **/
    var bar = document.createElement("div")
    bar.id = "A2D_BAR"
    if (!this.config.screen.useScreen || (this.config.screen.displayStyle == "Text") || !this.config.screen.displayBar) bar.className = "hidden"
    var screenBar = document.createElement(this.config.screen.displayStyle == "Bar" ? "meter" : "div")
    screenBar.id = "A2D_SCREEN_BAR"
    screenBar.classList.add(this.config.screen.displayStyle)
    if (this.config.screen.displayStyle == "Bar") {
      screenBar.value = 0
      screenBar.max= this.config.screen.delay
    }
    bar.appendChild(screenBar)

    /** internet Ping **/
    var internet = document.createElement("div")
    internet.id = "A2D_INTERNET"
    if (!this.config.internet.useInternet || !this.config.internet.displayPing) internet.className = "hidden"
    var internetText = document.createElement("div")
    internetText.id = "A2D_INTERNET_TEXT"
    internetText.textContent = "Ping: "
    internet.appendChild(internetText)
    var internetPing = document.createElement("div")
    internetPing.id = "A2D_INTERNET_PING"
    internetPing.classList.add("ping")
    internetPing.textContent = "Loading ..."
    internet.appendChild(internetPing)

    /** Radio **/
    var radio = document.createElement("div")
    radio.id = "A2D_RADIO"
    radio.className = "hidden"
    var radioImg = document.createElement("img")
    radioImg.id = "A2D_RADIO_IMG"
    radio.appendChild(radioImg)

    dom.appendChild(radio)
    dom.appendChild(screen)
    dom.appendChild(internet)
    dom.appendChild(bar)
    return dom
  },

  getScripts: function() {
    this.scanConfig()
    var ui = this.ui + "/" + this.ui + '.js'
    return [
       "/modules/MMM-Assistant2Display/components/display.js",
       "/modules/MMM-Assistant2Display/ui/" + ui,
       "/modules/MMM-Assistant2Display/components/youtube.js",
       "/modules/MMM-Assistant2Display/components/progressbar.js",
       "/modules/MMM-Assistant2Display/components/spotify.js",
       "https://cdn.materialdesignicons.com/5.2.45/css/materialdesignicons.min.css",
       "https://code.iconify.design/1/1.0.6/iconify.min.js"
    ]
  },

  getStyles: function() {
    return [
      "/modules/MMM-Assistant2Display/ui/" + this.ui + "/" + this.ui + ".css",
      "screen.css",
      "font-awesome.css"
    ]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json",
      it: "translations/it.json"
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
          if (this.config.screen.useScreen && (this.config.screen.displayStyle != "Text")) this.prepareBar()
          if (this.config.spotify.useSpotify && this.config.spotify.useIntegred) this.spotify.prepare()
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
          if (this.config.spotify.useSpotify && this.A2D.spotify.connected) {
            if (this.config.spotify.useIntegred) {
              this.sendSocketNotification("SPOTIFY_VOLUME", this.config.spotify.minVolume)
              this.displayResponse.hideSpotify()
            }
            else this.sendNotification("SPOTIFY_VOLUME", this.config.spotify.minVolume)
          }
          if (this.A2D.radio) this.radio.volume = 0.1
          if (this.A2D.locked) this.displayResponse.hideDisplay()
          break
        case "ASSISTANT_STANDBY":
          this.A2D.speak = false
          if (this.config.useYoutube && this.displayResponse.player) {
            this.displayResponse.player.command("setVolume", 100)
          }
          if (this.config.spotify.useSpotify) {
            if (this.config.spotify.useIntegred) {
              this.sendSocketNotification("SPOTIFY_VOLUME", this.config.spotify.maxVolume)
              if (this.A2D.spotify.connected && !this.displayResponse.working()) this.displayResponse.showSpotify()
            }
            else this.sendNotification("SPOTIFY_VOLUME", this.config.spotify.maxVolume)
          }
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
          if (this.A2D.spotify.connected && this.A2D.spotify.librespot) {
            if (this.config.spotify.useIntegred) this.sendSocketNotification("SPOTIFY_PAUSE")
            else this.sendSocketNotification("SPOTIFY_PAUSE")
          }
          if (this.A2D.radio) this.radio.pause()
          this.sendNotification("TV-STOP") // Stop MMM-FreeboxTV
          break
        case "A2D_ASSISTANT_BUSY":
          if (this.config.screen.useScreen && !this.A2D.locked) this.sendSocketNotification("SCREEN_STOP")
          break
        case "A2D_ASSISTANT_READY":
          if (this.config.screen.useScreen && !this.A2D.locked) this.sendSocketNotification("SCREEN_RESET")
          break
        case "A2D_VOLUME":
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
          if (this.A2D.spotify.connected && this.A2D.spotify.librespot) {
            if (this.config.spotify.useIntegred) this.sendSocketNotification("SPOTIFY_PAUSE")
            else this.sendSocketNotification("SPOTIFY_PAUSE")
          }
          if (payload.link) {
            if (payload.img) {
              var radioImg = document.getElementById("A2D_RADIO_IMG")
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
        case "SPOTIFY_UPDATE_DEVICE":
          if (this.config.spotify.useSpotify && !this.config.spotify.useIntegred) {
            if (payload.name) {
              if (payload.name == this.config.spotify.connectTo) {
                if (!this.A2D.spotify.librespot && this.config.screen.useScreen && !this.displayResponse.working()) {
                  this.sendSocketNotification("SCREEN_WAKEUP")
                  this.sendSocketNotification("SCREEN_LOCK", true)
                  this.A2D.spotify.librespot = true
                }
              }
              else if (this.A2D.spotify.librespot && this.config.screen.useScreen && !this.displayResponse.working()) {
                  this.sendSocketNotification("SCREEN_LOCK", false)
                  this.A2D.spotify.librespot = false
              }
            }
          }
          break
        case "SPOTIFY_CONNECTED":
          if (this.config.spotify.useSpotify && !this.config.spotify.useIntegred) this.A2D.spotify.connected = true
          break
        case "SPOTIFY_DISCONNECTED":
          if (this.config.spotify.useSpotify && !this.config.spotify.useIntegred) this.A2D.spotify.connected = false
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
        if (this.config.screen.useScreen && (this.config.screen.displayStyle == "Text")) {
          let counter = document.getElementById("A2D_SCREEN_COUNTER")
          counter.textContent = payload
        }
        break
      case "SCREEN_BAR":
        if (this.config.screen.useScreen) {
          if (this.config.screen.displayStyle == "Bar") {
            let bar = document.getElementById("A2D_SCREEN_BAR")
            bar.value= this.config.screen.delay - payload
          }
          else if (this.config.screen.displayStyle != "Text") {
            let value = (100 - ((payload * 100) / this.config.screen.delay))/100
            let timeOut = moment(new Date(this.config.screen.delay-payload)).format("mm:ss")
            this.bar.animate(value, {
              step: (state, bar) => {
                bar.path.setAttribute('stroke', state.color)
                bar.setText(this.config.screen.displayCounter ? timeOut : "")
                bar.text.style.color = state.color
              }
            })
          }
        }
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
        var ping = document.getElementById("A2D_INTERNET_PING")
        ping.textContent = payload
        break
      case "SNOWBOY_STOP":
        this.sendNotification("ASSISTANT_STOP")
        break
      case "SNOWBOY_START":
        this.sendNotification("ASSISTANT_START")
        break
      case "CAST_START":
        this.displayResponse.castStart(payload)
        break
      case "CAST_STOP":
        this.displayResponse.castStop()
        break
      case "SPOTIFY_PLAY":
        this.spotify.updateCurrentSpotify(payload)
        if (payload && payload.device && payload.device.name) { //prevent crash
          if (payload.device.name == this.config.spotify.connectTo) {
            if (!this.A2D.spotify.librespot && this.config.screen.useScreen && !this.displayResponse.working()) {
              this.sendSocketNotification("SCREEN_WAKEUP")
              this.sendSocketNotification("SCREEN_LOCK", true)
              this.A2D.spotify.librespot = true
            }
          }
          else {
            if (this.A2D.spotify.librespot && this.config.screen.useScreen && !this.displayResponse.working()) {
              this.sendSocketNotification("SCREEN_LOCK", false)
              this.A2D.spotify.librespot = false
            }
          }
        }
        break
      case "SPOTIFY_IDLE":
        this.spotify.updatePlayback(false)
        if (this.A2D.spotify.librespot && this.config.screen.useScreen && !this.displayResponse.working()) {
          this.sendSocketNotification("SCREEN_LOCK", false)
          this.A2D.spotify.librespot = false
        }
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

  prepareBar: function () {
    /** Prepare TimeOut Bar **/
    if (this.config.screen.displayStyle == "Bar") return
    this.bar = new ProgressBar[this.config.screen.displayStyle](document.getElementById('A2D_SCREEN_BAR'), {
      strokeWidth: this.config.screen.displayStyle == "Line" ? 2 : 5,
      trailColor: '#1B1B1B',
      trailWidth: 1,
      easing: 'easeInOut',
      duration: 500,
      svgStyle: null,
      from: {color: '#FF0000'},
      to: {color: '#00FF00'},
      text: {
        style: {
          position: 'absolute',
          left: '50%',
          top: this.config.screen.displayStyle == "Line" ? "0" : "50%",
          padding: 0,
          margin: 0,
          transform: {
              prefix: true,
              value: 'translate(-50%, -50%)'
          }
        }
      }
    })
  },

  checkStyle: function () {
    /** Crash prevent on Time Out Style Displaying **/
    /** --> Set to "Text" if not found */
    let Style = [ "Text", "Line", "SemiCircle", "Circle", "Bar" ]
    let found = Style.find((style) => {
      return style == this.config.screen.displayStyle
    })
    if (!found) {
      console.log("[A2D] displayStyle Error ! ["+ this.config.screen.displayStyle + "]")
      this.config.screen= Object.assign({}, this.config.screen, {displayStyle : "Text"} )
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

  screenShowing: function() {
    MM.getModules().enumerate((module)=> {
      module.show(1000, {lockString: "A2D_SCREEN"})
    })
  },

  screenHiding: function() {
    MM.getModules().enumerate((module)=> {
      module.hide(1000, {lockString: "A2D_SCREEN"})
    })
  },

  showRadio: function() {
    this.A2D = this.displayResponse.A2D
    this.A2D.radio = this.radioPlayer.play
    if (this.radioPlayer.img) {
      var radio = document.getElementById("A2D_RADIO")
      if (this.radioPlayer.play) radio.classList.remove("hidden")
      else radio.classList.add("hidden")
    }
  },

  /** Create Radio function and cb **/
  createRadio: function() {
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
        responseEmulate.transcription.transcription = " Telegram @" + handler.message.from.username + ": " + handler.args
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
