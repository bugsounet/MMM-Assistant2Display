/* Common A2D Class */

class DisplayClass {
  constructor (Config, callback) {
    this.config = Config
    this.sendSocketNotification = callback
    this.pos = 0
    this.urls= null
    this.timer = null
    this.response = null
    this.player = null
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
      if (ytLink) this.player.loadVideo( {id: ytLink[1], type : "id"})
      if (ytPlayList) this.player.loadVideo( {id: ytPlayList[1], type : "playlist"})
      
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
    if (this.player.status()) YT.classList.add("hidden")
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

  showYT(show) {
    if (!this.timer) {
      var YT = document.getElementById("A2D_YOUTUBE")
      var winh = document.getElementById("A2D")
      if (show) {
        winh.classList.remove("hidden")
        YT.classList.remove("hidden")
      } else {
        winh.classList.add("hidden")
        YT.classList.add("hidden")
      }
    }
  }
}
