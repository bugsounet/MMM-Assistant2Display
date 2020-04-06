/* Common A2D Class */

class DisplayClass {
  constructor (Config, callbacks) {
    this.config = Config
    this.sendSocketNotification = callbacks.sendSocketNotification
    this.sendNotification= callbacks.sendNotification
    this.sendTunnel = callbacks.tunnel
    this.timer = null
    this.player = null
    this.screenLock = false
    this.A2D = {
      speak : false,
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
        forceClose: false,
        position: 0,
        urls: null,
        length: 0
      },
      links: {
        displayed: false,
        urls: null,
        length: 0
      }
    }

    this.sendTunnel(this.A2D)
    console.log("[A2D] DisplayClass Loaded")
  }

  start(response) {
    /** Close all active windows and reset it **/
    if (this.A2D.youtube.displayed) this.player.command("stopVideo")
    if (this.A2D.photos.displayed) {
      this.A2D.photos.displayed = false
      this.resetPhotos()
      this.hideDisplay()
    }
    if (this.A2D.links.displayed) {
      this.resetLinks()
      this.hideDisplay()
    }

    /** prepare **/
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
        length: response.photos.length,
      },
      links: {
        urls: response.urls,
        length: response.urls.length
      }
    }


    /** the show must go on ! **/
    this.A2D = this.objAssign({}, this.A2D, tmp)
    this.prepareDisplay()
    if(this.config.photos.usePhotos && this.A2D.photos.length > 0) {
      this.A2DLock()
      this.A2D.photos.displayed = true
      this.A2D.photos.forceClose= false
      this.sendTunnel(this.A2D)
      this.photoDisplay()
    }
    else if (this.A2D.links.length > 0) {
      this.urlsScan()
    }
    A2D("Response Structure:", this.A2D)
  }

/** photos code **/
  photoDisplay() {
    if (this.A2D.photos.forceClose) return A2D("force close")
    this.A2DLock()
    var photo = document.getElementById("A2D_PHOTO")
    A2D("Loading photo #" + (this.A2D.photos.position+1) + "/" + (this.A2D.photos.length))
    photo.src = this.A2D.photos.urls[this.A2D.photos.position]
    this.showDisplay()
    photo.addEventListener("load", () => {
      A2D("Photo Loaded")
      this.timerPhoto = setTimeout( () => {
        this.photoNext()
      }, this.config.photos.displayDelay)
    }, {once: true})
    photo.addEventListener("error", (event) => {
      if (!this.A2D.photos.forceClose) {
        A2D("Photo Loading Error... retry with next")
        clearTimeout(this.timerPhoto)
        this.timerPhoto = null
        this.photoNext()
      }
    }, {once: true})
  }

  photoNext() {
    if (this.A2D.photos.position >= (this.A2D.photos.length-1) || this.A2D.photos.forceClose) {
      this.A2D.photos.displayed = false
      this.resetPhotos()
      this.hideDisplay()
    } else {
      this.A2D.photos.position++
      this.photoDisplay()
    }
  }

  resetPhotos() {
    this.A2D.photos.forceClose = true
    clearTimeout(this.timerPhoto)
    this.timerPhoto = null
    let tmp = {
      photos: {
        displayed: false,
        position: 0,
        urls: null,
        length: 0
      }
    }
    this.A2D = this.objAssign({}, this.A2D, tmp)
    A2D("Reset Photo", this.A2D)
    this.sendTunnel(this.A2D)
  }

/** urls scan : dispatch links and youtube **/
  urlsScan() {
    let tmp = {}
    var ytL = new RegExp("youtube\.com\/watch\\?v\=([0-9a-zA-Z\-\_]+)", "ig")
    var ytP = new RegExp("youtube\.com\/playlist\\?list\=([a-zA-Z0-9\-\_]+)", "ig")
    var ytLink = ytL.exec(this.A2D.links.urls[0])
    var ytPlayList = ytP.exec(this.A2D.links.urls[0])

    if (ytLink || ytPlayList) {
      tmp = {
        id: ytPlayList ?  ytPlayList[1] : ytLink[1],
        type: ytPlayList ? "playlist" : "id"
      },
      this.A2D.youtube = this.objAssign({}, this.A2D.youtube, tmp)
      if (this.config.useYoutube) {
        this.A2DLock()
        this.player.load({id: this.A2D.youtube.id, type : this.A2D.youtube.type})
      }
    } else if(this.config.links.useLinks) { // display only first link
      this.A2DLock()
      this.A2D.links.displayed = true
      this.sendTunnel(this.A2D)
      this.sendSocketNotification("PROXY_OPEN", this.A2D.links.urls[0])
    }
  }

/** link display **/
  linksDisplay() {
    var iframe = document.getElementById("A2D_OUTPUT")
    A2D("Loading", this.A2D.links.urls[0])
    this.showDisplay()
    iframe.src = "http://127.0.0.1:" + this.config.links.proxyPort + "/"+ this.A2D.links.urls[0]
    if (this.config.links.sandbox) iframe.sandbox = this.config.links.sandbox

    iframe.addEventListener("load", () => {
      A2D("URL Loaded")
      this.timerLinks = setTimeout( () => {
        this.resetLinks()
        this.hideDisplay()
      }, this.config.links.displayDelay)
    }, {once: true})
  }

  showDisplay() {
    A2D("Show Iframe")
    var YT = document.getElementById("A2D_YOUTUBE")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    var winh = document.getElementById("A2D")
    if (this.A2D.speak) winh.classList.add("hidden")
    else winh.classList.remove("hidden")

    if (this.A2D.links.displayed) iframe.classList.remove("hidden")
    if (this.A2D.photos.displayed) photo.classList.remove("hidden")
    if (this.A2D.photos.forceClose) photo.classList.add("hidden")
    if (this.A2D.youtube.displayed) YT.classList.remove("hidden")
  }

  resetLinks() {
    clearTimeout(this.timerLinks)
    this.timerLinks = null
    this.sendSocketNotification("PROXY_CLOSE")
    let tmp = {
      links: {
        displayed: false,
        urls: null,
        length: 0
      }
    }
    this.A2D = this.objAssign({}, this.A2D, tmp)
    A2D("Reset Links", this.A2D)
    this.sendTunnel(this.A2D)
  }

/** youtube rules **/
  showYT() {
    var YT = document.getElementById("A2D_YOUTUBE")
    var winh = document.getElementById("A2D")
    if (this.A2D.youtube.displayed) {
      this.A2DLock() // for YT playlist
      winh.classList.remove("hidden")
      YT.classList.remove("hidden")
    } else {
      if (this.A2D.photos.displayed || this.A2D.links.displayed) {
        winh.classList.remove("hidden")
        YT.classList.add("hidden")
      } else {
        winh.classList.add("hidden")
        YT.classList.add("hidden")
      }
    }
  }

  titleYT() {
    var tr = document.getElementById("A2D_TRANSCRIPTION").getElementsByTagName("p")
    tr[0].innerHTML= this.A2D.youtube.title
  }

  resetYT() {
    let tmp = {
      youtube: {
        displayed: false,
        id: null,
        type: null,
        title: null
      }
    }
    this.A2D = this.objAssign({}, this.A2D, tmp)
    A2D("Reset YT Struct", this.A2D)
    this.sendTunnel(this.A2D)
  }

/** Other Cmds **/
  prepare() {
    // reserved for extends
  }

  prepareDisplay() {
    // reserved for extends
  }

  hideDisplay() {
    // reserved for extends
  }

  A2DLock() {
    if (this.screenLock) return
    A2D("Lock Screen")
    MM.getModules().exceptWithClass("MMM-AssistantMk2").enumerate((module)=> {
      module.hide(15, {lockString: "A2D_LOCKED"})
    })
    this.sendSocketNotification("SCREEN_LOCK", true)
    this.screenLock = true
  }

  A2DUnlock () {
    if (!this.screenLock || this.A2D.youtube.displayed || this.A2D.photos.displayed || this.A2D.links.displayed) return
    A2D("Unlock Screen")
    MM.getModules().exceptWithClass("MMM-AssistantMk2").enumerate((module)=> {
      module.show(15, {lockString: "A2D_LOCKED"})
    })
    this.sendSocketNotification("SCREEN_LOCK", false)
    this.screenLock = false
  }

  objAssign (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
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
}
