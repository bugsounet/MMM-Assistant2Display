class Display extends DisplayClass {
  constructor (Config, callback) {
    super(Config, callback)
    console.log("[A2D] Extends Display with Classic ui Loaded")
  }

  prepare() {
    var dom = document.createElement("div")
    dom.id = "A2D"
    dom.classList.add("hidden")

    var scoutpan = document.createElement("div")
    scoutpan.id = "A2D_WINDOW"
    var scoutphoto = document.createElement("IMG")
    scoutphoto.id = "A2D_PHOTO"
    scoutphoto.classList.add("hidden")    
    var scout = document.createElement("iframe")
    scout.id = "A2D_OUTPUT"
    scout.scrolling="no"
    scout.classList.add("hidden")
    var scoutyt = document.createElement("div")
    scoutyt.id = "A2D_YOUTUBE"
    scoutyt.classList.add("hidden")
    var api = document.createElement("script")
    api.src = "https://www.youtube.com/iframe_api"
    var writeScript = document.getElementsByTagName("script")[0]
    writeScript.parentNode.insertBefore(api, writeScript)
    window.onYouTubeIframeAPIReady = () => {
      this.player = new YOUTUBE(
        "A2D_YOUTUBE",
        (show) => {
          this.A2D.youtube.displayed = show
          this.showYT()
        },
        (title) => {
          this.A2D.youtube.title = title
          this.titleYT()
        },
        (ended) => {
          this.sendAlive(false)
        }
      )
      this.player.init()
    }
    scoutpan.appendChild(scoutyt)
    scoutpan.appendChild(scoutphoto)
    scoutpan.appendChild(scout)

    var contener = document.createElement("div")
    contener.id = "A2D_CONTENER"

    var logo = document.createElement("div")
    logo.id = "A2D_LOGO"
    contener.appendChild(logo)
    var transcription = document.createElement("div")
    transcription.id = "A2D_TRANSCRIPTION"
    contener.appendChild(transcription)

    scoutpan.appendChild(contener)
    dom.appendChild(scoutpan)

    document.body.appendChild(dom)
    super.prepare()
    return dom
  }

  prepareDisplay() {
    A2D("Prepare Display with:", this.A2D.AMk2)
    var tr = document.getElementById("A2D_TRANSCRIPTION")
    tr.innerHTML = ""
    var t = document.createElement("p")
    t.className = "transcription"
    t.innerHTML = this.A2D.AMk2.transcription
    tr.appendChild(t)
    A2D("Prepare ok")
    super.prepareDisplay()
  }

  hideDisplay(force) {
    A2D("Hide Iframe")
    var YT = document.getElementById("A2D_YOUTUBE")
    var winh = document.getElementById("A2D")
    var tr = document.getElementById("A2D_TRANSCRIPTION")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    if (!force && this.A2D.youtube.displayed) {
      this.titleYT()
      YT.classList.remove("hidden")
    }
    else winh.classList.add("hidden")
    if (!this.A2D.youtube.displayed) {
      tr.innerHTML= ""
      this.sendAlive(false)
    }
    iframe.classList.add("hidden")
    iframe.src= "about:blank"
    photo.classList.add("hidden")
    photo.src= ""
    super.hideDisplay()
  }
}
