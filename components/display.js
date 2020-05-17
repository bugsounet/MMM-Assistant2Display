/* Common A2D Class */

class DisplayClass {
  constructor (Config, callbacks) {
    this.config = Config
    this.sendSocketNotification = callbacks.sendSocketNotification
    this.sendNotification= callbacks.sendNotification
    this.radioStop = callbacks.radioStop
    this.timer = null
    this.player = null
    this.A2D = {
      radio: false,
      speak: false,
      locked: false,
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
        urls: null,
        length: 0,
        running: false
      },
      spotify: {
        playing: false
      }
    }
    console.log("[A2D] DisplayClass Loaded")
  }

  start(response) {
    /** Close all active windows and reset it **/
    if (this.A2D.youtube.displayed) this.player.command("stopVideo")
    if (this.A2D.photos.displayed) {
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
      this.photoDisplay()
      this.showDisplay()
    }
    else if (this.A2D.links.length > 0) {
      this.urlsScan()
    }
    A2D("Response Structure:", this.A2D)
  }

/** photos code **/
  photoDisplay() {
    var photo = document.getElementById("A2D_PHOTO")
    A2D("Loading photo #" + (this.A2D.photos.position+1) + "/" + (this.A2D.photos.length))
    photo.src = this.A2D.photos.urls[this.A2D.photos.position]

    photo.addEventListener("load", () => {
      A2D("Photo Loaded")
      this.timerPhoto = setTimeout( () => {
        this.photoNext()
      }, this.config.photos.displayDelay)
    }, {once: true})
    photo.addEventListener("error", (event) => {
      if (this.A2D.photos.displayed) {
        A2D("Photo Loading Error... retry with next")
        clearTimeout(this.timerPhoto)
        this.timerPhoto = null
        this.photoNext()
      }
    }, {once: true})
  }

  photoNext() {
    if (this.A2D.photos.position >= (this.A2D.photos.length-1) ) {
      this.resetPhotos()
      this.hideDisplay()
    } else {
      this.A2D.photos.position++
      this.photoDisplay()
    }
  }

  resetPhotos() {
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
    var photo = document.getElementById("A2D_PHOTO")
    photo.removeAttribute('src')
    A2D("Reset Photos", this.A2D)

  }

/** urls scan : dispatch links, youtube, spotify **/
  urlsScan() {
    let tmp = {}
    if (this.config.useYoutube) {
      /** YouTube RegExp **/
      var ytL = new RegExp("youtube\.com\/watch\\?v\=([0-9a-zA-Z\-\_]+)", "ig")
      var ytP = new RegExp("youtube\.com\/playlist\\?list\=([a-zA-Z0-9\-\_]+)", "ig")

      /** Scan Youtube Link **/
      var ytLink = ytL.exec(this.A2D.links.urls[0])
      var ytPlayList = ytP.exec(this.A2D.links.urls[0])
      var YouTube = ytLink || ytPlayList

      if (YouTube) {
        if (this.A2D.radio) this.radioStop()
        if (this.A2D.spotify.playing && this.config.useSpotify) this.sendNotification("SPOTIFY_PAUSE")
        tmp = {
          id: ytPlayList ?  ytPlayList[1] : ytLink[1],
          type: ytPlayList ? "playlist" : "id"
        },
        this.A2D.youtube = this.objAssign({}, this.A2D.youtube, tmp)
        this.A2DLock()
        this.player.load({id: this.A2D.youtube.id, type : this.A2D.youtube.type})
        return
      }
    }
    if (this.config.useSpotify) {
      /** Spotify RegExp **/
      var spotifyArtist = new RegExp("open\.spotify\.com\/artist\/([0-9a-zA-Z\-\_]+)","ig")
      var spotifyAlbum = new RegExp("open\.spotify\.com\/album\/([0-9a-zA-Z\-\_]+)","ig")
      var spotifyTrack = new RegExp("open\.spotify\.com\/track\/([0-9a-zA-Z\-\_]+)","ig")
      var spotifyPlaylist = new RegExp("open\.spotify\.com\/playlist\/([0-9a-zA-Z\-\_]+)","ig")

      /** Scan Spotify Link **/
      var SpotifyArtist = spotifyArtist.exec(this.A2D.links.urls[0])
      var SpotifyAlbum = spotifyAlbum.exec(this.A2D.links.urls[0])
      var SpotifyTrack= spotifyTrack.exec(this.A2D.links.urls[0])
      var SpotifyPlaylist = spotifyPlaylist.exec(this.A2D.links.urls[0])
      var Spotify = SpotifyArtist || SpotifyAlbum || SpotifyTrack || SpotifyPlaylist

      if (Spotify) {
        let type = SpotifyArtist ? "artist" : (SpotifyAlbum ? "album" : (SpotifyPlaylist ? "playlist" : "track"))
        let id = SpotifyArtist ? SpotifyArtist[1] : (SpotifyAlbum ? SpotifyAlbum[1] : (SpotifyPlaylist ? SpotifyPlaylist [1] : SpotifyTrack[1]))
        if (type == "track") {
          // don't know why tracks works only with uris !?
          this.sendNotification("SPOTIFY_PLAY", {"uris": ["spotify:track:" + id ]})
        }
        else this.sendNotification("SPOTIFY_PLAY", {"context_uri": "spotify:"+ type + ":" + id})
        return
      }
    }
    if (this.config.links.useLinks) {
      this.A2DLock()
      this.A2D.links.displayed = true
      this.linksDisplay()
    }
  }

/** link display **/
  linksDisplay() {
    this.A2D.links.running = false
    var webView = document.getElementById("A2D_OUTPUT")
    A2D("Loading", this.A2D.links.urls[0])
    this.showDisplay()
    webView.src= this.A2D.links.urls[0]

    webView.addEventListener("did-fail-load", () => {
      console.log("[A2D:LINKS] Loading error")
    })
    webView.addEventListener("crashed", (event) => {
      console.log("[A2D:LINKS] J'ai tout pété mon général !!!")
      console.log("[A2D:LINKS]", event)
    })
    webView.addEventListener("console-message", (event) => {
      if (event.level == 1 && this.config.debug) console.log("[A2D:LINKS]", event.message)
    })
    webView.addEventListener("did-stop-loading", () => {
      if (this.A2D.links.running || (webView.getURL() == "about:blank")) return
      this.A2D.links.running = true
      A2D("URL Loaded", webView.getURL())
      webView.executeJavaScript(`
      var timer = null
      function scrollDown(posY){
        clearTimeout(timer)
        timer = null
        var scrollHeight = document.body.scrollHeight
        if (posY == 0) console.log("Begin Scrolling")
        if (posY > scrollHeight) posY = scrollHeight
        document.documentElement.scrollTop = document.body.scrollTop = posY;
        if (posY == scrollHeight) return console.log("End Scrolling")
        timer = setTimeout(function(){
          if (posY < scrollHeight) {
            posY = posY + ${this.config.links.scrollStep}
            scrollDown(posY);
          }
        }, ${this.config.links.scrollInterval});
      };
      if (${this.config.links.scrollActivate}) {
        setTimeout(scrollDown(0), ${this.config.links.scrollStart});
      };`)
    })
    this.timerLinks = setTimeout(() => {
      this.resetLinks()
      this.hideDisplay()
    }, this.config.links.displayDelay)
  }

  resetLinks() {
    clearTimeout(this.timerLinks)
    this.timerLinks = null
    let tmp = {
      links: {
        displayed: false,
        urls: null,
        length: 0,
        running: false
      }
    }
    this.A2D = this.objAssign({}, this.A2D, tmp)
    var iframe = document.getElementById("A2D_OUTPUT")
    iframe.src= "about:blank"
    A2D("Reset Links", this.A2D)
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
        this.hideDisplay()
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
    A2D("Reset YouTube", this.A2D)
  }

/** Cast **/
  castStart(url) {
    /** stop all process before starting cast **/
    if (this.A2D.youtube.displayed) this.player.command("stopVideo")
    if (this.A2D.spotify.playing && this.config.useSpotify) this.sendNotification("SPOTIFY_PAUSE")
    if (this.A2D.photos.displayed) {
      this.resetPhotos()
      this.hideDisplay()
    }
    if (this.A2D.links.displayed) {
      this.resetLinks()
      this.hideDisplay()
    }
    if (this.A2D.radio) this.radioStop()

    /** emulation of displaying links **/
    this.A2D.AMk2.transcription = "YouTube Cast"
    this.prepareDisplay()
    this.A2D.links.running = false
    var webView = document.getElementById("A2D_OUTPUT")
    A2D("Cast Loading", url)
    this.A2D.links.displayed = true
    this.A2D.links.running = true
    this.showDisplay()
    this.A2DLock()
    webView.src= url
  }

  castStop() {
    var webView = document.getElementById("A2D_OUTPUT")
    this.resetLinks()
    this.hideDisplay()
  }

/** Other Cmds **/
  prepare() {
    // reserved for extends
  }

  prepareDisplay() {
    // reserved for extends
  }

  showDisplay() {
    A2D("Show Iframe")
    var YT = document.getElementById("A2D_YOUTUBE")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    var winA2D = document.getElementById("A2D")
    if (this.A2D.speak) winA2D.classList.add("hidden")
    else winA2D.classList.remove("hidden")

    if (this.A2D.links.displayed) iframe.classList.remove("hidden")
    if (this.A2D.photos.displayed) photo.classList.remove("hidden")
    if (this.A2D.photos.forceClose) photo.classList.add("hidden")
    if (this.A2D.youtube.displayed) YT.classList.remove("hidden")
  }

  hideDisplay() {
    A2D("Hide Iframe")
    var winA2D = document.getElementById("A2D")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    var YT = document.getElementById("A2D_YOUTUBE")

    if (!this.A2D.youtube.displayed) YT.classList.add("hidden")
    if (!this.A2D.links.displayed) iframe.classList.add("hidden")
    if (!this.A2D.photos.displayed) photo.classList.add("hidden")
    if (this.A2D.speak || !this.working()) winA2D.classList.add("hidden")

    if (!this.A2D.speak && !this.working()) this.A2DUnlock()
  }

  A2DLock() {
    if (this.A2D.locked) return
    A2D("Lock Screen")
    MM.getModules().exceptWithClass("MMM-AssistantMk2").enumerate((module)=> {
      module.hide(15, {lockString: "A2D_LOCKED"})
    })
    if (this.config.screen.useScreen) this.sendSocketNotification("SCREEN_LOCK", true)
    this.A2D.locked = true
  }

  A2DUnlock () {
    if (!this.A2D.locked || this.working()) return
    A2D("Unlock Screen")
    MM.getModules().exceptWithClass("MMM-AssistantMk2").enumerate((module)=> {
      module.show(15, {lockString: "A2D_LOCKED"})
    })
    if (this.config.screen.useScreen && !this.A2D.spotify.playing) this.sendSocketNotification("SCREEN_LOCK", false)
    this.A2D.locked = false
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

  working () {
    return (this.A2D.youtube.displayed || this.A2D.photos.displayed || this.A2D.links.displayed)
  }
}
