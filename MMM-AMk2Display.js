/** AMk2 Display **/
/** @bugsounet **/

Module.register("MMM-AMk2Display",{
  defaults: {
    debug:true,
  },

  start: function () {
    self = this;
    var count = 0;
  },

  getStyles: function() {
    return [
      "MMM-AMk2Display.css",
    ];
  },

  suspend: function() {
    log("[DISPLAY] This module cannot be suspended.")
  },

  resume: function() {
    log("[DISPLAY] This module cannot be resumed.")
  },

  prepare: function() {
    var dom = document.createElement("div")
    dom.id = "AMK2_DISPLAY"
    dom.classList.add("hidden")

    var scoutpan = document.createElement("div")
    scoutpan.id = "AMK2_DISPLAY_WINDOW"
    var scout = document.createElement("iframe")
    scout.id = "AMK2_DISPLAY_OUTPUT"
    scoutpan.appendChild(scout)

    var contener = document.createElement("div")
    contener.id = "AMK2_DISPLAY_CONTENER"
    
    var contener2 = document.createElement("div")
    contener2.id = "AMK2_DISPLAY_CONTENER2"   

    var logo = document.createElement("div")
    logo.id = "AMK2_DISPLAY_LOGO"
    
    contener2.appendChild(logo)
    var transcription = document.createElement("div")
    transcription.id = "AMK2_DISPLAY_TRANSCRIPTION"
    contener2.appendChild(transcription)
 
    var help = document.createElement("div")
    help.id = "AMK2_DISPLAY_HELP"
   
    var helpbox = document.createElement("div")
    helpbox.id = "AMK2_DISPLAY_HELPBOX"
    help.appendChild(helpbox)
    
    var trysay = document.createElement("div")
    trysay.id = "AMK2_DISPLAY_TRYSAY"
    helpbox.appendChild(trysay)
    
    var wordbox = document.createElement("div")
    wordbox.id = "AMK2_DISPLAY_WORDBOX"
    helpbox.appendChild(wordbox)
    
    contener2.appendChild(help)
    contener.appendChild(contener2)
        
    scoutpan.appendChild(contener)
    dom.appendChild(scoutpan)

    document.body.appendChild(dom)
    return dom
  },

  notificationReceived: function (notification, payload) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        this.prepare()
        break
      case "DISPLAY_URL":
        this.displayURL(payload)
        break
    }
  },

  displayURL: function (payload) {
    var self = this
    log("[DISPLAY]", payload)
    if (payload.url.length > 0) {
      var iframe = document.getElementById("AMK2_DISPLAY_OUTPUT")
      iframe.src = payload.url[0]
      var tr = document.getElementById("AMK2_DISPLAY_TRANSCRIPTION")
      tr.innerHTML = ""
      var t = document.createElement("p")
      t.className = "transcription"
      t.innerHTML = payload.key
      tr.appendChild(t)
      var winh = document.getElementById("AMK2_DISPLAY")
      var wordbox = document.getElementById("AMK2_DISPLAY_WORDBOX")
      var trysay = document.getElementById("AMK2_DISPLAY_TRYSAY")
      trysay.textContent = ""
      wordbox.innerHTML = ""
      if(payload.trysay) {
        trysay.textContent = payload.trysay
        var word = []
        for (let [item, value] of Object.entries(payload.help)) {
          word[item] = document.createElement("div")
          word[item].id = "AMK2_DISPLAY_WORD"
          word[item].textContent = value
          word[item].addEventListener("click", function() {
            log("[DISPLAY] Clicked", value)
            iframe.src = "http://127.0.0.1:8080/activatebytext/?query=" + value
            self.hiddenDisplay(true)
          });
          wordbox.appendChild(word[item])
        }
      }
      winh.classList.remove("hidden")
      this.autoScrollDown()
      setTimeout( () => {
        this.hiddenDisplay()
      }, 1000 * 30)
    }
  },

  hiddenDisplay: function (send) {
    var winh = document.getElementById("AMK2_DISPLAY")
    var tr = document.getElementById("AMK2_DISPLAY_TRANSCRIPTION")
    var iframe = document.getElementById("AMK2_DISPLAY_OUTPUT")
    var trysay = document.getElementById("AMK2_DISPLAY_TRYSAY")
    var wordbox = document.getElementById("AMK2_DISPLAY_WORDBOX")
    
    winh.classList.add("hidden")
    tr.innerHTML= ""
    if (!send) iframe.src= ""
    trysay.textContent = ""
    wordbox.innerHTML = ""
  },

  autoScrollDown: function() {
    var iframe = document.getElementById("AMK2_DISPLAY_OUTPUT")
    iframe.addEventListener("load", function () {
      log("URL Loaded")
      setTimeout(function ()
      {
        // do something to scroll down

      }, 3000);
    })
  }
});
