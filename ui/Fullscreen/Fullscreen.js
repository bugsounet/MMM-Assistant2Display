class Display extends DisplayClass {
  constructor (Config, callback) {
    super(Config, callback)
    this.sendSocketNotification = callback
    console.log("Extend Display with Fullscreen ui Loaded")
  }


  prepare() {
    var dom = document.createElement("div")
    dom.id = "A2D"
    dom.classList.add("hidden")

    var scoutpan = document.createElement("div")
    scoutpan.id = "A2D_WINDOW"
    var scout = document.createElement("iframe")
    scout.id = "A2D_OUTPUT"
    scout.scrolling="no"
    scoutpan.appendChild(scout)
    dom.appendChild(scoutpan)

    document.body.appendChild(dom)
    super.prepare()
    return dom
  }

  prepareDisplay(response) {
    A2D("Prepare with", response)
    var self = this
    var winh = document.getElementById("A2D")
    var iframe = document.getElementById("A2D_OUTPUT")
    A2D("Prepare ok")
    super.prepareDisplay(response)
  }

  hideDisplay() {
    A2D("Hide Iframe")
    var winh = document.getElementById("A2D")
    var iframe = document.getElementById("A2D_OUTPUT")
    winh.classList.add("hidden")
    iframe.src= "about:blank"
    super.hideDisplay()
  }
}
