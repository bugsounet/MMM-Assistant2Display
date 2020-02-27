class Display extends DisplayClass {
  constructor (Config, callback) {
    super(Config, callback)
    this.callback = callback
    console.log("Extend Classic2 Display Loaded")
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
    var winh = document.getElementById("A2D")
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
    var winh = document.getElementById("A2D")
    var tr = document.getElementById("A2D_TRANSCRIPTION")
    var iframe = document.getElementById("A2D_OUTPUT")
    var trysay = document.getElementById("A2D_TRYSAY")
    var wordbox = document.getElementById("A2D_WORDBOX")
    winh.classList.add("hidden")
    tr.innerHTML= ""
    iframe.src= "about:blank"
    trysay.textContent = ""
    wordbox.innerHTML = ""
    super.hideDisplay()
  }
  
}
