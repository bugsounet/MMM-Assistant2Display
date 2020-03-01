class Display extends DisplayClass {
  constructor (Config, callback) {
    super(Config, callback)
    this.sendSocketNotification = callback
    console.log("[AMK2:ADDONS:A2D] Extend Display with Fullscreen ui Loaded")
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
    dom.appendChild(scoutpan)

    document.body.appendChild(dom)
    super.prepare()
    return dom
  }

  hideDisplay() {
    A2D("Hide Iframe")
    var winh = document.getElementById("A2D")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    winh.classList.add("hidden")
    iframe.classList.add("hidden")
    iframe.src= "about:blank"
    photo.classList.add("hidden")
    photo.src= ""
    super.hideDisplay()
  }
}
