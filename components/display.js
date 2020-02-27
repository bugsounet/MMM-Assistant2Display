/* Common A2D Class */

class DisplayClass {
  constructor (Config, callback) {
    this.config = Config
    this.sendSocketNotification = callback
    this.pos = 0
    this.urls= null
    this.timer = null
    console.log("DisplayClass Loaded")
  }

  scan(response) {
    A2D("Scan",response)
    if(response.urls && response.urls.length > 0) {
      this.pos = 0
      this.urls= response.urls
      this.prepareDisplay(response)
      this.urlsScan(response.urls)
    }
  }
  
  urlsScan() {
    this.sendSocketNotification("URL_DETAIL", this.urls[this.pos])
  }

  urlDisplay() {
    var self = this
    var iframe = document.getElementById("A2D_OUTPUT")
    A2D("Loading", this.urls[this.pos])
    this.showDisplay()
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
  
  showDisplay() {
    A2D("Show Iframe")
    var winh = document.getElementById("A2D")
    winh.classList.remove("hidden")
  }

  prepare() {
    // do nothing
  }

  prepareDisplay(response) {
    // do nothing
  }

  hideDisplay() {
    // do nothing
  }

  resetTimer() {
    clearTimeout(this.timer)
    this.pos = 0
    this.urls= null
    this.timer = null
  }
}
