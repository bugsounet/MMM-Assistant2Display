class Display extends DisplayClass {
  constructor (Config, callback) {
    super(Config, callback)
    this.callback = callback
    console.log("Extend Display with Classic ui Loaded")
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

  prepareDisplay(response) {
    A2D("Prepare with", response)
    var self = this
    var tr = document.getElementById("A2D_TRANSCRIPTION")
    tr.innerHTML = ""
    var t = document.createElement("p")
    t.className = "transcription"
    t.innerHTML = response.transcription.transcription
    tr.appendChild(t)
    A2D("Prepare ok")
    super.prepareDisplay(response)
  }

  hideDisplay() {
    A2D("Hide Iframe")
    var winh = document.getElementById("A2D")
    var tr = document.getElementById("A2D_TRANSCRIPTION")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    winh.classList.add("hidden")
    tr.innerHTML= ""
    iframe.classList.add("hidden")
    iframe.src= "about:blank"
    photo.classList.add("hidden")
    photo.src= ""
    super.hideDisplay()
  }
}
