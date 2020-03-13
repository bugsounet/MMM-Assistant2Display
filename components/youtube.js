/** Youtube Library **/

class YOUTUBE {
  constructor(id, callback) {
    this.cb = callback
    this.config = config
    this.idDom = id
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
    console.log("[AMK2:ADDONS:A2D] YOUTUBE Class Loaded")
  }

  init() {
    console.log(this.idDom)
    this.YTPlayer = new YT.Player(this.idDom, this.makeOptions())
    A2D("YOUTUBE API is ready.")
  }

  makeOptions(options={}) {
    options.playerVars = Object.assign({}, this.playerVars)
    options.events = {}
    options.events.onReady = (ev) => {
      A2D("YT Player is ready.")
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
          this.controlPlayer("playVideo")
          break
      }
      A2D("YT Status:", this.state[ev.data])
    }
    options.events.onError = (ev) => {
      if (ev.data == "2") ev.target.stopVideo()
      A2D(`[YOUTUBE] Player Error ${ev.data}:`, this.error[ev.state] ? this.error[ev.state] : "Unknown Error")
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

  status() {
    return this.videoPlaying
  }
}
