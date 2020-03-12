/* Common A2D Class */

class DisplayClass {
  constructor (Config, callback) {
    this.config = Config
    this.sendSocketNotification = callback
    this.pos = 0
    this.urls= null
    this.timer = null
    this.response = null
    this.YTPlayer = null
    this.list = false
    this.playerVars= {
      controls: 0,
      hl: "en",
      enablejsapi: 1,
      rel: 0,
      cc_load_policy: 0,
    },
    this.videoPlaying= false
    console.log("[AMK2:ADDONS:A2D] DisplayClass Loaded")
  }

  start(response) {
    A2D("Response Scan")
    if(response.photos && response.photos.length > 0) {
      this.pos = 0
      this.urls= response.photos
      this.prepareDisplay(response)
      this.photoDisplay()
    } else if(response.urls && response.urls.length > 0) {
      this.pos = 0
      this.urls= response.urls
      this.response = response
      this.prepareDisplay(response)
      this.urlsScan()
    }
  }

  urlsScan() {
    var ytL = new RegExp("youtube\.com\/watch\\?v\=([0-9a-zA-Z\-\_]+)", "ig")
    var ytP = new RegExp("youtube\.com\/playlist\\?list\=([a-zA-Z0-9\-\_]+)", "ig")
    var ytLink = ytL.exec(this.urls[this.pos])
    var ytPlayList = ytP.exec(this.urls[this.pos])
    
    if (ytLink || ytPlayList) {
      A2D("YT Link:", this.urls[this.pos], ytPlayList )
      if (ytLink) this.loadYTVideo( {id: ytLink[1], type : "id"})
      if (ytPlayList) this.loadYTVideo( {id: ytPlayList[1], type : "playlist"})
      
    } else {
      this.sendSocketNotification("PROXY_OPEN", this.urls[this.pos])
    }
  }

  photoDisplay() {
    if (!this.urls) return
    var self = this
    var photo = document.getElementById("A2D_PHOTO")
    A2D("Loading photo #" + (this.pos+1) + "/" + self.urls.length)
    this.showDisplay(false,true)
    photo.src = this.urls[this.pos]
    photo.addEventListener("load", function() {
      A2D("Photo Loaded")
      self.timer = setTimeout( () => {
        if (self.pos >= (self.urls.length-1)){
          self.hideDisplay()
        } else {
          self.pos++
          self.photoDisplay()
        }
      }, self.config.displayDelay)
    }, {once: true})
  }

  urlDisplay() {
    var self = this
    if (!this.urls) return
    var iframe = document.getElementById("A2D_OUTPUT")
    A2D("Loading", this.urls[this.pos])
    this.showDisplay(true,false)
    iframe.src = "http://127.0.0.1:" + this.config.proxyPort + "/"+ this.urls[this.pos]
    if (this.config.sandbox) iframe.sandbox = this.config.sandbox

    iframe.addEventListener("load", function() {
      A2D("URL Loaded")
      self.timer = setTimeout( () => {
        self.sendSocketNotification("PROXY_CLOSE")
        if (self.pos >= (self.urls.length-1)){
          self.hideDisplay()
        } else {
          self.pos++
          self.urlsScan()
        }
      }, self.config.displayDelay)
    }, {once: true})
  }

  showDisplay(urls,photos) {
    A2D("Show Iframe")
    var YT = document.getElementById("A2D_YOUTUBE")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    var winh = document.getElementById("A2D")
    if (urls) iframe.classList.remove("hidden")
    if (photos) photo.classList.remove("hidden")
    if (this.videoPlaying) YT.classList.add("hidden")
    winh.classList.remove("hidden")
  }

  resetTimer() {
    clearTimeout(this.timer)
    this.pos = 0
    this.urls= null
    this.timer = null
  }

  prepare() {
    // reserved for extends
  }

  prepareDisplay(response) {
    // reserved for extends
  }

  hideDisplay() {
    // reserved for extends
  }


/** Youtube Code **/

  initYTPlayer(options) {
    this.YTPlayer = new YT.Player("A2D_YOUTUBE", options)
  }

  makeYTOptions(options={}) {
    options.playerVars = Object.assign({}, this.playerVars)
    options.events = {}
    options.events.onReady = (ev) => {
      A2D("YT Player is ready.")
    }
    options.events.onStateChange = (ev) => {
      var YT = document.getElementById("A2D_YOUTUBE")
      var winh = document.getElementById("A2D")
      if (ev.data == "-1") {
        A2D("YT Status Changed: Video unstarted")
      }
      if (ev.data == "0") {
        A2D("YT Status Changed: Video ended")
        winh.classList.add("hidden")
        YT.classList.add("hidden")
        this.videoPlaying= false
      }
      if (ev.data == "1") {
        A2D("YT Status Changed: Video playing")
        winh.classList.remove("hidden")
        YT.classList.remove("hidden")
        ev.target.unloadModule("captions")
        ev.target.unloadModule("cc")
        this.videoPlaying= true
      }
      if (ev.data == "2") {
        A2D("YT Status Changed: Video paused")
        winh.classList.add("hidden")
        YT.classList.add("hidden")
        this.videoPlaying= false
      }
      if (ev.data == "3") {
        A2D("YT Status changed: Video buffering")
        this.videoPlaying= true
      }
      if (ev.data == "5") {
        A2D("YT Status Changed: Video cued")
        if (this.list) {
          var list = this.controlPlayer("getPlaylist")
          if (!Array.isArray(list)) return false
          A2D("YT Playlist count:", list.length)
        }
        this.controlPlayer("playVideo")
      }
    }
    options.events.onError = (ev) => {
      var error = "Unknown Error"
      switch(ev.data) {
        case 2 :
          error = "Invalid Parameter"
          ev.target.stopVideo()
          break
        case 5 :
          error = "HTML5 Player Error"
          break
        case 100 :
          error = "Video Not Found (removed or privated)"
          break
        case 101 :
        case 150 :
          error = "Not Allowed By Owner"
          break
        default:
          break
      }
      A2D(`[YOUTUBE] Player Error ${ev.data}:`, error)
    }
    return options
  }
  
  loadYTVideo(payload) {
    var option = {}
    var method = ""
    if (!payload) return false
    if (typeof payload.id == "undefined") return false
    else var id = payload.id
    this.list = false
    A2D("YTLOAD", payload)
    if (payload.type == "id") {
      option = {videoId: id}
      method = "VideoById"
    }
    else if (payload.type == "playlist") {
      option = {
        list: id,
        listType: "playlist",
        index: 0,
      }
      method = "Playlist"
    } else return false
    option.suggestedQuality = "default"
    var fn = "cue" + method
    this.controlPlayer(fn, option)
  }

  controlPlayer(command, param=null) {
    A2D("YT Control:", command, param ? param : "")
    if (!this.YTPlayer || !command) return false
    if (typeof this.YTPlayer[command] == "function") {
      var ret = this.YTPlayer[command](param)
      if (ret && ret.constructor.name == "Y") ret = null
      return ret
    }
  }
}
