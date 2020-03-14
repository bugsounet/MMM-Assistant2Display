/** Youtube Library **/

class YOUTUBE {
  constructor(id, callback, title) {
    this.cb = callback
    this.title = title
    this.idDom = id
    this.YTPlayer = null
    this.YTStarted = false
    this.list = false
    this.playerVars= {
      controls: 0,
      hl: config.language,
      enablejsapi: 1,
      rel: 0,
      cc_load_policy: 0,
      showinfo: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy:3,
      modestbranding: 1
    }
    this.videoPlaying= false
    this.state = {
      "-1": "Video unstarted",
      "0": "Video ended",
      "1": "Video playing",
      "2": "Video paused",
      "3": "Video buffering",
      "5": "Video cued"
    }
    this.error = {
      "2": "Invalid Parameter",
      "5": "HTML5 Player Error",
      "100": "Video Not Found (removed or privated)",
      "101": "Not Allowed By Owner",
      "150": "Not Allowed By Owner"
    }
    this.errorYT = false
    console.log("[AMK2:ADDONS:A2D] YOUTUBE Class Loaded")
  }

  init() {
    this.YTPlayer = new YT.Player(this.idDom, this.makeOptions())
    A2D("YOUTUBE API is ready.")
  }

  makeOptions(options={}) {
    options.playerVars = Object.assign({}, this.playerVars)
    options.events = {}
    options.events.onReady = (ev) => {
      A2D("YT Player is ready.")
    }
    options.events.onError = (ev) => {
      this.errorYT = true
      if (ev.data == "2") ev.target.stopVideo()
      A2D(`Player Error ${ev.data}:`, this.error[ev.data] ? this.error[ev.data] : "Unknown Error")
    }

    options.events.onPlaybackQualityChange = (ev) => {
      var playbackQuality = ev.data
      A2D("YT Quality actual: " + playbackQuality)
    }

    options.events.onStateChange = (ev) => {
      switch(ev.data) {
        case -1:
        case 0:
        case 2:
          this.videoPlaying= false
          this.cb(this.videoPlaying)
          break
        case 1:
          var title = this.YTPlayer.l.videoData.title
          A2D("YT Playing Title:" , title)
          this.title(title)
        case 3:
          this.videoPlaying= true
          this.cb(this.videoPlaying)
          break
        case 5:
          if (this.list) {
            var list = this.controlPlayer("getPlaylist")
            if (!Array.isArray(list)) return false
            A2D("YT Playlist count:", list.length)
          }
          if(!this.errorYT && this.YTStarted) this.controlPlayer("playVideo")
          break
      }
      A2D("YT Status:", this.state[ev.data])
    }
    return options
  }

  loadVideo(payload) {
    var option = {}
    var method = ""
    if (!payload) return false
    if (typeof payload.id == "undefined") return false
    else var id = payload.id
    this.list = false
    A2D("YTLOAD", payload)
    if (payload.type == "id") {
      option = {
        videoId: id,
      }
      method = "VideoById"
    }
    else if (payload.type == "playlist") {
      option = {
        list: id,
        listType: "playlist",
        index: 0
      }
      method = "Playlist"
    } else return false

    var fn = "cue" + method
    this.YTStarted = true
    this.errorYT = false
    this.controlPlayer(fn, option)
  }

  controlPlayer(command, param=null) {
    A2D("YT Control:", command, param ? param : "")
    if (!this.YTPlayer || !command) return false
    if (typeof this.YTPlayer[command] == "function") {
      var ret = this.YTPlayer[command](param)
      if (command == "stopVideo") this.YTStarted = false
      if (ret && ret.constructor.name == "Y") ret = null
      return ret
    }
  }

  status() {
    return this.videoPlaying
  }
}
