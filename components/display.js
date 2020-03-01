/* Common A2D Class */

class DisplayClass {
  constructor (Config, callback) {
    this.config = Config
    this.sendSocketNotification = callback
    this.pos = 0
    this.urls= null
    this.timer = null
    this.response = null
    console.log("DisplayClass Loaded")
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
      this.urlsScan()
    }
  }

  urlsScan() {
    if (!this.urls) return
    var re_ytl = new RegExp("youtube\.com\/watch\\?v\=([0-9a-zA-Z\-\_]+)", "ig")
    var re_ytp = new RegExp("youtube\.com\/playlist\\?list\=([a-zA-Z0-9\-\_]+)", "ig")
    var self = this
    var ytlink = re_ytl.exec(this.urls[this.pos])
    var ytpl = re_ytp.exec(this.urls[this.pos])

    if (ytlink || ytpl) {
      A2D("Bypass YT Link:", this.urls[this.pos])
      this.pos++
      if (self.pos >= (self.urls.length-1)){
        return A2D("No Link to Display")
      }
    } else {
      this.prepareDisplay(this.response)
      this.sendSocketNotification("PROXY_OPEN", this.urls[this.pos])
    }
  }

  photoDisplay() {
    var self = this
    if (!this.urls) return
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
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    var winh = document.getElementById("A2D")
    if (urls) iframe.classList.remove("hidden")
    if (photos) photo.classList.remove("hidden")
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
}
