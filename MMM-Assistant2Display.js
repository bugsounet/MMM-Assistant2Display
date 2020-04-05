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
    debug:false,
    verbose: false,
    links: {
      useLinks: true,
      displayDelay: 30 * 1000,
      scrollStep: 25,
      scrollInterval: 1000,
      scrollStart: 1000,
      proxyPort: 8081,
      sandbox: null,
      verbose: true
    },
    photos: {
      usePhotos: true,
      displayDelay: 15 * 1000,
    },
    useYoutube: true,
    volume: {
      useVolume: true,
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
      pin: 21
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
  },

  start: function () {
    this.A2D= {}
    this.config = this.configAssignment({}, this.defaults, this.config)
    this.volumeScript= {
      "OSX": `osascript -e 'set volume output volume #VOLUME#'`,
      "ALSA": `amixer sset -M 'PCM' #VOLUME#%`,
      "HIFIBERRY-DAC": `amixer sset -M 'Digital' #VOLUME#%`,
      "PULSE": `amixer set Master #VOLUME#% -q`,
      "RESPEAKER_SPEAKER": `amixer -M sset Speaker #VOLUME#%`,
      "RESPEAKER_PLAYBACK": `amixer -M sset Playback #VOLUME#%`
    }
    
    this.helperConfig= {
      debug: this.config.debug,
      verbose: this.config.verbose,
      volumeScript: this.volumeScript[this.config.volume.volumePreset],
      useA2D: this.useA2D,
      links: this.config.links,
      screen: this.config.screen,
      pir: this.config.pir,
      governor: this.config.governor,
      internet: this.config.internet
    }

    if (this.config.debug) A2D = A2D_
    var callbacks= {
      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      "sendNotification": (noti, params)=> {
        this.sendNotification(noti, params)
      },
      "tunnel": (payload) => {
        this.A2D.AMk2 = payload.AMk2
        this.A2D.photos= payload.photos
        this.A2D.links= payload.links
      }
    }
    this.displayResponse = new Display(this.config, callbacks)
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
    ];
  },

  suspend: function() {
    A2D("This module cannot be suspended.")
  },

  resume: function() {
    A2D("This module cannot be resumed.")
  },

  notificationReceived: function (notification, payload) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        if (this.useA2D) this.displayResponse.prepare()
        this.sendSocketNotification("INIT", this.helperConfig)
        break
      case "ASSISTANT_READY":
        if (this.useA2D) this.onReady()
        break
      case "ASSISTANT_LISTEN":
      case "ASSISTANT_THINK":
        if (this.useA2D) {
          if (this.config.useYoutube && this.displayResponse.player) this.displayResponse.player.command("setVolume", 5)
          this.displayResponse.hideDisplay(true)
        }
        break
      case "ASSISTANT_STANDBY":
        if (this.useA2D) {
          this.displayResponse.showYT()
          if (this.config.useYoutube && this.displayResponse.player) this.displayResponse.player.command("setVolume", 100)
        }
        break
      case "ASSISTANT_HOOK":
      case "ASSISTANT_CONFIRMATION":
        if (this.useA2D) {
          this.displayResponse.resetTimer()
          this.sendSocketNotification("PROXY_CLOSE")
        }
        break
      case "A2D":
        if (this.useA2D) this.displayResponse.start(payload)
        break
      case "A2D_STOP":
        if (this.useA2D) {
          if (this.config.useYoutube && this.displayResponse.player) this.displayResponse.player.command("stopVideo")
          this.displayResponse.resetTimer()
          this.displayResponse.hideDisplay()
          this.displayResponse.A2DUnlock()
        }
        break
      case "A2D_AMK2_BUSY":
        if (this.useA2D) this.onBefore()
        break
      case "A2D_AMK2_READY":
        if (this.useA2D) this.onAfter()
        break
      case "VOLUME_SET":
        if (this.useA2D && this.config.volume.useVolume) {
          this.sendSocketNotification("SET_VOLUME", payload)
        }
        break
      case "WAKEUP": /** for external wakeup **/
        if (this.useA2D && this.config.screen.useScreen) {
          this.sendSocketNotification("SCREEN_WAKEUP")
        }
        break
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "A2D_READY":
        this.displayResponse.linksDisplay()
        break
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
          message: "Internet is DOWN ! Retry: " + param.payload,
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
        if (this.Snowboy) this.sendNotification("SNOWBOY_STOP")
        else if (this.Hotword) this.sendNotification("HOTWORD_PAUSE")
        break
      case "SNOWBOY_START":
        if (this.Snowboy) this.sendNotification("SNOWBOY_START")
        else if (this.Hotword) this.sendNotification("HOTWORD_RESUME")
        break
    }
  },

  scanConfig: function() {
    this.useA2D = false
    this.Hotword = false
    this.Snowboy = false
    this.ui = "Fullscreen"

    console.log("[A2D] Scan config.js file")
    var AMk2Found = false
    for (let [item, value] of Object.entries(config.modules)) {
      if (value.module == "MMM-AssistantMk2") {
        AMk2Found = true
        if (value.config.ui && ((value.config.ui === "Classic2") || (value.config.ui === "Classic"))) {
          this.ui = value.config.ui
        }
        this.useA2D = value.config.useA2D ? value.config.useA2D : false
      }
      if (value.module == "MMM-Snowboy" && !value.disabled) {
        console.log("[A2D] MMM-Snowboy detected!")
        this.Snowboy = true
      }
      if (value.module == "MMM-Hotword"&& !value.disabled) {
        console.log("[A2D] MMM-Hotword detected!")
        this.Hotword = true
      }
    }
    if (!AMk2Found) console.log("[A2D][ERROR] AMk2 not found!")

    if (this.Hotword && this.Snowboy) console.log("[A2D][ERROR] 2 detectors actived !")

    console.log("[A2D] Auto choice UI", this.ui)
    if (!this.useA2D) {
      console.log("[A2D][ERROR] A2D is desactived!")
      console.log("[A2D][ERROR] set `useA2D: true,` in AMk2 configuration !")
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
    this.sendNotification("ASSISTANT_ACTIVATE", { profile: "default", type: "TEXT", key: this.config.briefToday.welcome, chime: false })
  },

  onBefore: function () {
    if (this.config.screen.useScreen) this.sendSocketNotification("SCREEN_STOP")
  },

  onAfter: function () {
    if (this.config.screen.useScreen) this.sendSocketNotification("SCREEN_RESET")
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
});
