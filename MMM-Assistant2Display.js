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
    youtube: {
      useYoutube: false,
      useVLC: false,
      minVolume: 30,
      maxVolume: 100
    },
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
      displayDelay: 10 * 1000
    },
    volume: {
      useVolume: false,
      volumePreset: "ALSA",
      myScript: null
    },
    briefToday: {
      useBriefToday: false,
      welcome: "brief Today"
    },
    screen: {
      useScreen: false,
      delay: 5 * 60 * 1000,
      turnOffDisplay: true,
      mode: 1,
      ecoMode: true,
      delayed: 0,
      displayCounter: true,
      text: "Auto Turn Off Screen:",
      displayBar: true,
      displayStyle: "Text",
      detectorSleeping: false,
      governorSleeping: false,
      displayLastPresence: true,
      LastPresenceText: "Last Presence:"
    },
    touch: {
      useTouch: true,
      mode: 2
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
    cast: {
      useCast: false,
      castName: "MagicMirror_A2D",
      port: 8569
    },
    spotify: {
      useSpotify: false,
      useBottomBar: false,
      useLibrespot: false,
      connectTo: null,
      playDelay: 3000,
      minVolume: 10,
      maxVolume: 90,
      updateInterval: 1000,
      idleInterval: 10000,
      username: "",
      password: "",
      PATH: "../../../", // Needed Don't modify it !
      TOKEN: "./spotify-token.json",
      CLIENT_ID: "",
      CLIENT_SECRET: "",
      deviceDisplay: "Listening on",
      usePause: true,
      typeArtist: "artist",
      typePlaylist: "playlist",
      typeAlbum: "album",
      typeTrack: "track"
    },
    NPMCheck: {
      useChecker: true,
      delay: 10 * 60 * 1000,
      useAlert: true
    }
  },

  start: function () {
    if (this.config.youtube.useYoutube && this.config.youtube.useVLC) this.initializeVolumeVLC()

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
      spotify: this.config.spotify,
      dev: this.config.dev,
      NPMCheck: this.config.NPMCheck,
      youtube: this.config.youtube
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
      "spotify": (params) => { // try to use spotify callback to unlock screen ...
        if (params) this.A2D.spotify.connected = true
        else {
          this.A2D.spotify.connected = false
          if (this.A2D.spotify.librespot && this.config.screen.useScreen && !this.displayResponse.working()) {
              this.sendSocketNotification("SCREEN_LOCK", false)
          }
          this.A2D.spotify.librespot = false
        }
      }
    }
    this.displayResponse = new Display(this.config, callbacks)
    if (this.config.spotify.useSpotify) this.spotify = new Spotify(this.config.spotify, callbacks, this.config.debug)
    this.A2D = this.displayResponse.A2D

    this.bar= null
    this.checkStyle()
    this.spotifyNewVolume = false
    this.userPresence = null
    this.lastPresence = null
    if (this.useA2D) console.log("[A2D] initialized.")
  },

  getDom: function () {
    var dom = document.createElement("div")
    dom.id = "A2D_DISPLAY"

    if (this.config.spotify.useSpotify && !this.config.spotify.useBottomBar) {
      spotify= this.spotify.prepareMini()
      dom.appendChild(spotify)
    }

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

    /** Last user Presence **/
    var presence = document.createElement("div")
    presence.id = "A2D_PRESENCE"
    presence.className = "hidden"
    var presenceText = document.createElement("div")
    presenceText.id = "A2D_PRESENCE_TEXT"
    presenceText.textContent = this.config.screen.LastPresenceText
    presence.appendChild(presenceText)
    var presenceDate = document.createElement("div")
    presenceDate.id = "A2D_PRESENCE_DATE"
    presenceDate.classList.add("presence")
    presenceDate.textContent = "Loading ..."
    presence.appendChild(presenceDate)
    
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
    dom.appendChild(bar)
    dom.appendChild(presence)
    dom.appendChild(internet)

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
       "https://code.iconify.design/1/1.0.6/iconify.min.js",
       "/modules/MMM-Assistant2Display/components/long-press-event.js"
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
      it: "translations/it.json",
      de: "translations/de.json",
      es: "translations/es.json"
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
          if (this.config.spotify.useSpotify && this.config.spotify.useBottomBar) this.spotify.prepare()
          if (this.config.touch.useTouch) this.touchScreen(this.config.touch.mode)
          break
        case "ASSISTANT_READY":
          this.onReady()
          break
        case "ALEXA_ACTIVATE":
        case "ASSISTANT_LISTEN":
        case "ASSISTANT_THINK":
          this.A2D.speak = true
          if (this.config.youtube.useYoutube && this.displayResponse.player) {
            if (!this.config.youtube.useVLC) this.displayResponse.player.command("setVolume", 5)
            else this.sendSocketNotification("YT_VOLUME", this.config.youtube.minVolume)
          }
          if (this.config.spotify.useSpotify && this.A2D.spotify.librespot) {
            this.A2D.spotify.targetVolume = this.A2D.spotify.currentVolume
            this.sendSocketNotification("SPOTIFY_VOLUME", this.config.spotify.minVolume)
          }
          if (this.A2D.radio) this.radio.volume = 0.1
          if (this.A2D.locked) this.displayResponse.hideDisplay()
          break
        case "ALEXA_STANDBY":
        case "ASSISTANT_STANDBY":
          this.A2D.speak = false
          if (this.config.youtube.useYoutube && this.displayResponse.player) {
            if (!this.config.youtube.useVLC) this.displayResponse.player.command("setVolume", 100)
            else this.sendSocketNotification("YT_VOLUME", this.config.youtube.maxVolume)
          }
          if (this.config.spotify.useSpotify && this.A2D.spotify.librespot && !this.A2D.spotify.forceVolume) {
            this.sendSocketNotification("SPOTIFY_VOLUME", this.A2D.spotify.targetVolume)
          }
          this.A2D.spotify.forceVolume= false
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
              if (this.config.youtube.useVLC) {
                this.sendSocketNotification("YT_STOP")
                this.A2D.youtube.displayed = false
                this.displayResponse.showYT()
                this.displayResponse.A2DUnlock()
                this.displayResponse.resetYT()
              }
              else this.displayResponse.player.command("stopVideo")
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
          if (this.A2D.spotify.librespot) {
            if (this.config.spotify.usePause) this.sendSocketNotification("SPOTIFY_PAUSE")
            else this.sendSocketNotification("SPOTIFY_STOP")
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
          if (this.A2D.spotify.librespot) this.sendSocketNotification("SPOTIFY_STOP")
          if (this.A2D.youtube.displayed) {
            if (this.config.youtube.useVLC) {
              this.sendSocketNotification("YT_STOP")
              this.A2D.youtube.displayed = false
              this.displayResponse.showYT()
              this.displayResponse.A2DUnlock()
              this.displayResponse.resetYT()
            }
            else this.displayResponse.player.command("stopVideo")
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
        case "A2D_SPOTIFY_PLAY":
          if (this.config.spotify.useSpotify) {
            if (this.A2D.youtube.displayed && this.A2D.spotify.librespot) {
              if (this.A2D.radio) this.radio.pause()
              if (this.config.youtube.useVLC) {
                this.sendSocketNotification("YT_STOP")
                this.A2D.youtube.displayed = false
                this.displayResponse.showYT()
                this.displayResponse.A2DUnlock()
                this.displayResponse.resetYT()
              }
              else this.displayResponse.player.command("stopVideo")
            }
            this.sendSocketNotification("SPOTIFY_PLAY")
          }
          break
        case "A2D_SPOTIFY_PAUSE":
          if (this.config.spotify.useSpotify) {
            this.sendSocketNotification("SPOTIFY_PAUSE")
          }
          break
        case "A2D_SPOTIFY_STOP":
          if (this.config.spotify.useSpotify) {
            if (this.A2D.spotify.librespot) this.sendSocketNotification("SPOTIFY_STOP")
            else this.sendSocketNotification("SPOTIFY_PAUSE")
          }
          break
        case "A2D_SPOTIFY_NEXT":
          if (this.config.spotify.useSpotify) {
            this.sendSocketNotification("SPOTIFY_NEXT")
          }
          break
        case "A2D_SPOTIFY_PREVIOUS":
          if (this.config.spotify.useSpotify) {
            this.sendSocketNotification("SPOTIFY_PREVIOUS")
          }
          break
        case "A2D_SPOTIFY_SHUFFLE":
          if (this.config.spotify.useSpotify) {
            this.sendSocketNotification("SPOTIFY_SHUFFLE", !this.A2D.spotify.shuffle)
          }
          break
        case "A2D_SPOTIFY_REPEAT":
          if (this.config.spotify.useSpotify) {
            this.sendSocketNotification("SPOTIFY_REPEAT", (this.A2D.spotify.repeat == "off" ? "track" : "off"))
          }
          break
        case "A2D_SPOTIFY_TRANSFER":
          if (this.config.spotify.useSpotify) {
            this.sendSocketNotification("SPOTIFY_TRANSFER", payload)
          }
          break
        case "A2D_SPOTIFY_VOLUME":
          if (this.config.spotify.useSpotify) {
            this.A2D.spotify.forceVolume = true
            this.sendSocketNotification("SPOTIFY_VOLUME", payload)
          }
          break
        case "A2D_SPOTIFY_SEARCH":
          /** enforce type **/
          var type = payload.query.split(" ")
          if (type[0] == this.config.spotify.typePlaylist) type = "playlist"
          else if (type[0] == this.config.spotify.typeAlbum) type= "album"
          else if (type[0] == this.config.spotify.typeTrack) type= "track"
          else if (type[0] == this.config.spotify.typeArtist) type= "artist"
          else type = null
          if (type) {
            payload.query = payload.query.replace(type + " ","")
            payload.type = type
          }
          var pl = {
            query: {
              q: payload.query,
              type: payload.type,
            },
            condition: {
              random: payload.random,
              autoplay: true,
            }
          }
          this.sendSocketNotification("SEARCH_AND_PLAY", pl)
          if (this.A2D.youtube.displayed && this.A2D.spotify.librespot) {
            if (this.config.youtube.useVLC) {
              this.sendSocketNotification("YT_STOP")
              this.A2D.youtube.displayed = false
              this.displayResponse.showYT()
              this.displayResponse.A2DUnlock()
              this.displayResponse.resetYT()
            }
            else this.displayResponse.player.command("stopVideo")
          }
          break
      }
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "NPM_UPDATE":
        if (payload && payload.length > 0) {
          if (this.config.NPMCheck.useAlert) {
            payload.forEach(npm => {
              this.sendNotification("SHOW_ALERT", {
                type: "notification" ,
                message: "[NPM] " + npm.library + " v" + npm.installed +" -> v" + npm.latest,
                title: this.translate("UPDATE_NOTIFICATION_MODULE", { MODULE_NAME: npm.module }),
                timer: this.config.NPMCheck.delay - 2000
              })
            })
          }
          this.sendNotification("NPM_UPDATE", payload)
        }
        break
      case "SCREEN_PRESENCE":
        if (payload) this.lastPresence = moment().format("LL HH:mm")
        else this.userPresence = this.lastPresence
        if (this.userPresence && this.config.screen.useScreen && this.config.screen.displayLastPresence) {
          let presence= document.getElementById("A2D_PRESENCE")
          presence.classList.remove("hidden")
          let userPresence= document.getElementById("A2D_PRESENCE_DATE")
          userPresence.textContent= this.userPresence
        }
        break
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
        this.sendSocketNotification("SCREEN_WAKEUP")
        this.displayResponse.castStart(payload)
        break
      case "CAST_STOP":
        this.displayResponse.castStop()
        break
      case "SPOTIFY_PLAY":
        this.spotify.updateCurrentSpotify(payload)
        //console.log("Spotify PLAY status:", this.A2D.spotify)
        if (!this.A2D.spotify.connected) return // don't check if not connected (use spotify callback)
        if (payload && payload.device && payload.device.name) { //prevent crash
          this.A2D.spotify.repeat = payload.repeat_state
          this.A2D.spotify.shuffle = payload.shuffle_state
          if (payload.device.name == this.config.spotify.connectTo) {
            if (this.A2D.radio) this.radio.pause()
            this.A2D.spotify.currentVolume = payload.device.volume_percent
            if (!this.A2D.spotify.librespot) this.A2D.spotify.librespot = true
            if (this.A2D.spotify.connected && this.config.screen.useScreen && !this.displayResponse.working()) {
              this.sendSocketNotification("SCREEN_WAKEUP")
              this.sendSocketNotification("SCREEN_LOCK", true)
            }
          }
          else {
            if (this.A2D.spotify.connected && this.A2D.spotify.librespot && this.config.screen.useScreen && !this.displayResponse.working()) {
              this.sendSocketNotification("SCREEN_LOCK", false)
            }
            if (this.A2D.spotify.librespot) this.A2D.spotify.librespot = false
          }
        }
        break
      case "SPOTIFY_IDLE":
        this.spotify.updatePlayback(false)
        //console.log("Spotify IDLE status:", this.A2D.spotify)
        if (this.A2D.spotify.librespot && this.config.screen.useScreen && !this.displayResponse.working()) {
          this.sendSocketNotification("SCREEN_LOCK", false)
        }
        this.A2D.spotify.librespot = false
        break
      case "DONE_SPOTIFY_VOLUME":
        if (this.A2D.spotify.forceVolume && this.config.spotify.useSpotify) {
          if (this.A2D.spotify.librespot) {
            this.A2D.spotify.targetVolume = payload
          }
        }
        break
      case "FINISH_YOUTUBE":
        //console.log("Finish YT")
        this.A2D.youtube.displayed = false
        this.displayResponse.showYT()
        this.displayResponse.A2DUnlock()
        this.displayResponse.resetYT()
        break
    }
  },

  scanConfig: function() {
    this.useA2D = false
    this.ui = "Windows"
    console.log("[A2D] Scan config.js file")
    var GAFound = false
    var GAActivated= false
    var AlexaFound= false
    var AlexaActivated= false
    for (let [item, value] of Object.entries(config.modules)) {
      if (value.module == "MMM-GoogleAssistant") {
        GAFound = true
        if (value.position == "fullscreen_above") {
          if (value.config.responseConfig && value.config.responseConfig.screenRotate) this.ui = "FullscreenRotate"
          else this.ui = "Fullscreen"
        }
        GAActivated = value.config.A2DServer && value.config.A2DServer.useA2D && !value.disabled
      }
      if (value.module == "MMM-Alexa") {
        AlexaFound = true
        AlexaActivated = value.config.A2DServer && !value.disabled
      }
    }
    if (GAFound) {
      if (!GAActivated) console.log("[A2D][WARN] GoogleAssistant is disabled!")
      else console.log("[A2D] Found: GoogleAssistant")
    } else console.log("[A2D][WARN] GoogleAssistant not found!")

    if (AlexaFound) {
      if (!AlexaActivated) console.log("[A2D][WARN] Alexa is disabled!")
      else console.log("[A2D] Found: Alexa")
    } else console.log("[A2D][WARN] Alexa not found!")

    this.useA2D = GAActivated || AlexaActivated
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

  resume: function() {
    if (this.A2D.spotify.connected && this.config.spotify.useBottomBar) {
      this.displayResponse.showSpotify()
      A2D("Spotify is resumed.")
    }
  },

  suspend: function() {
    if (this.A2D.spotify.connected && this.config.spotify.useBottomBar) {
      this.displayResponse.hideSpotify()
      A2D("Spotify is suspended.")
    }
  },

  showRadio: function() {
    this.A2D = this.displayResponse.A2D
    this.A2D.radio = this.radioPlayer.play
    if (this.radioPlayer.img) {
      var radio = document.getElementById("A2D_RADIO")
      if (this.radioPlayer.play) radio.classList.remove("hidden")
      else radio.classList.add("hidden")
    }
    if (this.A2D.radio) {
      this.sendSocketNotification("SCREEN_WAKEUP")
      this.sendSocketNotification("SCREEN_LOCK", true)
    } else {
      this.sendSocketNotification("SCREEN_LOCK", false)
    }
  },

  /** TouchScreen Feature **/
  touchScreen: function (mode) {
    let clickCount = 0
    let clickTimer = null
    let A2Display = document.getElementById("A2D_DISPLAY")

    switch (mode) {
      case 1:
        /** mode 1 **/
        window.addEventListener('click', () => {
          clickCount++
          if (clickCount === 1) {
            clickTimer = setTimeout(() => {
              clickCount = 0
              this.sendSocketNotification("SCREEN_WAKEUP")
            }, 400)
          } else if (clickCount === 2) {
            clearTimeout(clickTimer)
            clickCount = 0
            this.sendSocketNotification("SCREEN_FORCE_END")
          }
        }, false)
        break
      case 2:
        /** mode 2 **/
        A2Display.addEventListener('click', () => {
          if (clickCount) return clickCount = 0
          if (!this.hidden) this.sendSocketNotification("SCREEN_WAKEUP")
        }, false)

        window.addEventListener('long-press', () => {
          clickCount = 1
          if (this.hidden) this.sendSocketNotification("SCREEN_WAKEUP")
          else this.sendSocketNotification("SCREEN_FORCE_END")
          clickTimer = setTimeout(() => { clickCount = 0 }, 400)
        }, false)
        break
      case 3:
        /** mode 3 **/
        A2Display.addEventListener('click', () => {
          clickCount++
          if (clickCount === 1) {
            clickTimer = setTimeout(() => {
              clickCount = 0
              this.sendSocketNotification("SCREEN_WAKEUP")
            }, 400)
          } else if (clickCount === 2) {
            clearTimeout(clickTimer)
            clickCount = 0
            this.sendSocketNotification("SCREEN_FORCE_END")
          }
        }, false)

        window.addEventListener('click', () => {
          if (!this.hidden) return
          clickCount = 3
          this.sendSocketNotification("SCREEN_WAKEUP")
          clickTimer = setTimeout(() => { clickCount = 0 }, 400)
        }, false)
        break
    }
    if (!mode) A2D("Touch Screen Function disabled.")
    else A2D("Touch Screen Function added. [mode " + mode +"]")
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
    if (this.config.spotify.useSpotify) {
      commander.add({
        command: "spotify",
        description: "Spotify commands",
        callback: "tbSpotify"
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
        responseEmulate.transcription.transcription = " Telegram @" + handler.message.from.username + ": " + handler.args
        responseEmulate.transcription.done = true
        responseEmulate.urls[0] = isLink ? handler.args : ("http://" + handler.args)
        if (this.config.screen.useScreen) this.sendSocketNotification("SCREEN_WAKEUP")
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
  },

  tbSpotify: function(command, handler) {
    if (handler.args) {
      var args = handler.args.toLowerCase().split(" ")
      var params = handler.args.split(" ")
      if (args[0] == "play") {
        handler.reply("TEXT", "Spotify PLAY")
        this.notificationReceived("A2D_SPOTIFY_PLAY")
      }
      if (args[0] == "pause") {
        handler.reply("TEXT", "Spotify PAUSE")
        this.notificationReceived("A2D_SPOTIFY_PAUSE")
      }
      if (args[0] == "stop") {
        handler.reply("TEXT", "Spotify STOP")
        this.notificationReceived("A2D_SPOTIFY_STOP")
      }
      if (args[0] == "next") {
        handler.reply("TEXT", "Spotify NEXT")
        this.notificationReceived("A2D_SPOTIFY_NEXT")
      }
      if (args[0] == "previous") {
        handler.reply("TEXT", "Spotify PREVIOUS")
        this.notificationReceived("A2D_SPOTIFY_PREVIOUS")
      }
      if (args[0] == "volume") {
        if (args[1]) {
          if (isNaN(args[1])) return handler.reply("TEXT", "Must be a number ! [0-100]")
          if (args[1] > 100) args[1] = 100
          if (args[1] < 0) args[1] = 0
          handler.reply("TEXT", "Spotify VOLUME: " + args[1])
          this.notificationReceived("A2D_SPOTIFY_VOLUME", args[1])
        } else handler.reply("TEXT", "Define volume [0-100]")
      }
      if (args[0] == "to") {
        if (args[1]) {
          handler.reply("TEXT", "Spotify TRANSFER to: " + params[1] + " (if exist !)")
          this.notificationReceived("A2D_SPOTIFY_TRANSFER", params[1])
        }
        else handler.reply("TEXT", "Define the device name (case sensitive)")
      }
    } else {
      handler.reply("TEXT", 'Need Help for /spotify commands ?\n\n\
  *play*: Launch music (last title)\n\
  *pause*: Pause music\n\
  *stop*: Stop music\n\
  *next*: Next track\n\
  *previous*: Previous track\n\
  *volume*: Volume control, it need a value 0-100\n\
  *to*: Transfert music to another device (case sensitive)\
  ',{parse_mode:'Markdown'})
    }
  },

  /** initialise volume control for VLC **/
  initializeVolumeVLC: function() {
    if (!this.config.youtube.useVLC) return
    /** convert volume **/
    try {
      let valueMin = null
      valueMin = parseInt(this.config.youtube.minVolume)
      if (typeof valueMin === "number" && valueMin >= 0 && valueMin <= 100) this.config.youtube.minVolume = ((valueMin * 255) / 100).toFixed(0)
      else {
        console.error("[A2D] config.youtube.minVolume error! Corrected with 30")
        this.config.youtube.minVolume = 70
      }
    } catch (e) {
      console.error("[A2D] config.youtube.minVolume error!", e)
      this.config.youtube.minVolume = 70
    }
    try {
      let valueMax = null
      valueMax = parseInt(this.config.youtube.maxVolume)
      if (typeof valueMax === "number" && valueMax >= 0 && valueMax <= 100) this.config.youtube.maxVolume = ((valueMax * 255) / 100).toFixed(0)
      else {
        console.error("[A2D] config.youtube.maxVolume error! Corrected with 100")
        this.config.youtube.maxVolume = 255
      }
    } catch (e) {
      console.error("[A2D] config.youtube.maxVolume error!", e)
      this.config.youtube.maxVolume = 255
    }
    console.log("[A2D] VLC Volume Control initialized!")
  }
});
