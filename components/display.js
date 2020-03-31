/* Common A2D Class */

class DisplayClass {
  constructor (Config, callbacks) {
    this.config = Config
    this.sendSocketNotification = callbacks.sendSocketNotification
    this.sendNotification= callbacks.sendNotification
    this.sendTunnel = callbacks.tunnel
    this.timer = null
    this.player = null
    this.A2D = {
      AMk2: {
        transcription: null,
        done: null,
        trysay: null,
        help: null
      },
      youtube: {
        displayed: false,
        id: null,
        type: null,
        title: null
      },
      photos: {
        displayed: false,
        position: 0,
        urls: null,
        length: 0
      },
      links: {
        displayed: false,
        position: 0,
        urls: null,
        length: 0
      }
    }
    console.log("[A2D] DisplayClass Loaded")
  }

  start(response) {
    let tmp = {}
    A2D("Response Scan")
    tmp = {
      AMk2: {
        transcription: response.transcription.transcription,
        done: response.transcription.done,
        trysay: response.trysay,
        help: response.help
      },
      photos: {
        position: 0,
        urls: response.photos,
        length: response.photos.length
      },
      links: {
        position: 0,
        urls: response.urls,
        length: response.urls.length
      }
    }
    this.A2D = this.objAssign({}, this.A2D, tmp)
    this.prepareDisplay()
    this.sendAlive(true)
    if(this.config.usePhotos && this.A2D.photos.length > 0) {
      this.photoDisplay()
    } else if (this.A2D.links.length > 0) {
      this.urlsScan()
    }
    A2D("Response Structure:", this.A2D)
    this.sendTunnel(this.A2D)
  }

  urlsScan() {
    let tmp = {}
    var ytL = new RegExp("youtube\.com\/watch\\?v\=([0-9a-zA-Z\-\_]+)", "ig")
    var ytP = new RegExp("youtube\.com\/playlist\\?list\=([a-zA-Z0-9\-\_]+)", "ig")
    var ytLink = ytL.exec(this.A2D.links.urls[this.A2D.links.position])
    var ytPlayList = ytP.exec(this.A2D.links.urls[this.A2D.links.position])

    if (ytLink || ytPlayList) {
      tmp = {
        id: ytPlayList ?  ytPlayList[1] : ytLink[1],
        type: ytPlayList ? "playlist" : "id"
      },
      this.A2D.youtube = this.objAssign({}, this.A2D.youtube, tmp)
      if (this.config.useYoutube) this.player.load({id: this.A2D.youtube.id, type : this.A2D.youtube.type})
    } else if(this.config.useLinks) {
      this.sendSocketNotification("PROXY_OPEN", this.A2D.links.urls[this.A2D.links.position])
    }
  }

  photoDisplay() {
    var photo = document.getElementById("A2D_PHOTO")
    A2D("Loading photo #" + (this.A2D.photos.position+1) + "/" + (this.A2D.photos.length))
    this.A2D.photos.displayed = true
    this.showDisplay()
    photo.src = this.A2D.photos.urls[this.A2D.photos.position]
    photo.addEventListener("load", () => {
      A2D("Photo Loaded")
      this.timer = setTimeout( () => {
        this.photoNext()
      }, this.config.displayDelay)
    }, {once: true})
    photo.addEventListener("error", (event) => {
      A2D("Photo Loading Error... retry with next")
      clearTimeout(this.timer)
      this.timer = null
      this.photoNext()
    }, {once: true})
  }

  photoNext() {
    if (this.A2D.photos.position >= (this.A2D.photos.length-1)) {
      this.resetTimer()
      this.hideDisplay()
    } else {
      this.A2D.photos.position++
      this.photoDisplay()
    }
  }

  linksDisplay() {
    var iframe = document.getElementById("A2D_OUTPUT")
    A2D("Loading", this.A2D.links.urls[this.A2D.links.position])
    this.A2D.links.displayed = true
    this.showDisplay()
    iframe.src = "http://127.0.0.1:" + this.config.proxyPort + "/"+ this.A2D.links.urls[this.A2D.links.position]
    if (this.config.sandbox) iframe.sandbox = this.config.sandbox

    iframe.addEventListener("load", () => {
      A2D("URL Loaded")
      this.timer = setTimeout( () => {
        this.linksNext()
      }, this.config.displayDelay)
    }, {once: true})
  }

  linksNext() {
    this.sendSocketNotification("PROXY_CLOSE")
    if (this.A2D.links.position >= (this.A2D.links.length-1)) {
      this.resetTimer()
      this.hideDisplay()
    } else {
      this.A2D.links.position++
      this.urlsScan()
    }
  }

  showDisplay() {
    A2D("Show Iframe")
    var YT = document.getElementById("A2D_YOUTUBE")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    var winh = document.getElementById("A2D")
    if (this.A2D.links.displayed) iframe.classList.remove("hidden")
    if (this.A2D.photos.displayed) photo.classList.remove("hidden")
    if (this.A2D.youtube.displayed) YT.classList.add("hidden")
    winh.classList.remove("hidden")
  }

  resetTimer() {
    clearTimeout(this.timer)
    this.timer = null
    this.resetStruct()
  }

  prepare() {
    // reserved for extends
  }

  prepareDisplay() {
    // reserved for extends
  }

  hideDisplay(force) {
    // reserved for extends
  }

  showYT() {
    if (this.A2D.photos.displayed || this.A2D.links.displayed) return
    var YT = document.getElementById("A2D_YOUTUBE")
    var winh = document.getElementById("A2D")
    if (this.A2D.youtube.displayed) {
      this.sendAlive(true) // for YT playlist
      winh.classList.remove("hidden")
      YT.classList.remove("hidden")
    } else {
      winh.classList.add("hidden")
      YT.classList.add("hidden")
    }
  }

  titleYT() {
    var tr = document.getElementById("A2D_TRANSCRIPTION").getElementsByTagName("p")
    tr[0].innerHTML= this.A2D.youtube.title
  }

  objAssign(result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (
            typeof result[key] === "object" && result[key]
            && Object.prototype.toString.call(result[key]) !== "[object Array]"
          ) {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.objAssign({}, result[key], item[key])
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
  }

  resetStruct() {
    let tmp = {
      photos: {
        displayed: false,
        position: 0,
        urls: null,
        length: 0
      },
      links: {
        displayed: false,
        position: 0,
        urls: null,
        length: 0
      }
    }
    this.A2D = this.objAssign({}, this.A2D, tmp)
    A2D("Reset Struct", this.A2D)
    this.sendTunnel(this.A2D)
  }

  sendAlive(status) {
    A2D("SendAlive:", status)
    this.sendSocketNotification("SCREEN_LOCK", status)
  }
}
