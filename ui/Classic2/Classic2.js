class Display extends DisplayClass {
  constructor (Config, callback) {
    super(Config, callback)
    this.callback = callback
    console.log("[AMK2:ADDONS:A2D] Extend Display with Classic2 ui Loaded")
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
      this.player = new YOUTUBE(this.config, "A2D_YOUTUBE", (show) => { this.showYT(show) })
      this.player.init()
    }
    scoutpan.appendChild(scoutyt)
    scoutpan.appendChild(scoutphoto)
    scoutpan.appendChild(scout)

    var contener = document.createElement("div")
    contener.id = "A2D_CONTENER"

    var contener2 = document.createElement("div")
    contener2.id = "A2D_CONTENER2"   

    var logo = document.createElement("div")
    logo.id = "A2D_LOGO"

    contener2.appendChild(logo)
    var transcription = document.createElement("div")
    transcription.id = "A2D_TRANSCRIPTION"
    contener2.appendChild(transcription)

    var help = document.createElement("div")
    help.id = "A2D_HELP"

    var helpbox = document.createElement("div")
    helpbox.id = "A2D_HELPBOX"
    help.appendChild(helpbox)

    var trysay = document.createElement("div")
    trysay.id = "A2D_TRYSAY"
    helpbox.appendChild(trysay)

    var wordbox = document.createElement("div")
    wordbox.id = "A2D_WORDBOX"
    helpbox.appendChild(wordbox)

    contener2.appendChild(help)
    contener.appendChild(contener2)

    scoutpan.appendChild(contener)
    dom.appendChild(scoutpan)

    document.body.appendChild(dom)
    super.prepare()
    return dom
  }

  prepareDisplay(response) {
    A2D("Prepare with", response)
    var self = this
    var iframe = document.getElementById("A2D_OUTPUT")
    var tr = document.getElementById("A2D_TRANSCRIPTION")
    tr.innerHTML = ""
    var t = document.createElement("p")
    t.className = "transcription"
    t.innerHTML = response.transcription.transcription
    tr.appendChild(t)
    var wordbox = document.getElementById("A2D_WORDBOX")
    var trysay = document.getElementById("A2D_TRYSAY")
    trysay.textContent = ""
    wordbox.innerHTML = ""
    if(response.trysay) {
      trysay.textContent = response.trysay
      var word = []
      for (let [item, value] of Object.entries(response.help)) {
        word[item] = document.createElement("div")
        word[item].id = "A2D_WORD"
        word[item].textContent = value
        word[item].addEventListener("click", function() {
          self.resetTimer()
          log("Clicked", value)
          self.hideDisplay()
          iframe.src = "http://localhost:8080/activatebytext/?query=" + value
        });
        wordbox.appendChild(word[item])
      }
    }
    A2D("Prepare ok")
    super.prepareDisplay(response)
  }

  hideDisplay() {
    A2D("Hide Iframe")
    var YT = document.getElementById("A2D_YOUTUBE")
    var winh = document.getElementById("A2D")
    var tr = document.getElementById("A2D_TRANSCRIPTION")
    var iframe = document.getElementById("A2D_OUTPUT")
    var photo = document.getElementById("A2D_PHOTO")
    var trysay = document.getElementById("A2D_TRYSAY")
    var wordbox = document.getElementById("A2D_WORDBOX")
    if (this.player.status()) YT.classList.remove("hidden")
    else winh.classList.add("hidden")
    tr.innerHTML= ""
    iframe.classList.add("hidden")
    iframe.src= "about:blank"
    photo.classList.add("hidden")
    photo.src= ""
    trysay.textContent = ""
    wordbox.innerHTML = ""
    super.hideDisplay()
  }
}
