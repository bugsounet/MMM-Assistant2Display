/** Assistant 2 Display **/
/** @bugsounet **/

Module.register("MMM-Assistant2Display",{
  defaults: {
    debug:true,
    displayDelay: 30 * 1000,
    displaySpeed: 5
  },

  start: function () {
    self = this;
    this.pos = 0
  },

  getStyles: function() {
    return [
      "MMM-Assistant2Display.css",
    ];
  },

  suspend: function() {
    log("[A2D] This module cannot be suspended.")
  },

  resume: function() {
    log("[A2D] This module cannot be resumed.")
  },

  prepare: function() {
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
    return dom
  },

  notificationReceived: function (notification, payload) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        this.prepare()
        this.sendSocketNotification("INIT")
        break
      case "ASSISTANT2DISPLAY":
        log("[A2D] Received:", payload)
        this.scan(payload)
        break
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "A2D_READY":
        this.urlDisplay()
        break
    }
  },

  scan: function (response) {
    this.pos = 0
    var urlToDisplay = 0
    log("[A2D] Scan",response)
    if(response.urls && response.urls.length > 0) {
      this.prepareDisplay(response)
      this.showDisplay()
      this.urlsScan(response.urls)
      //this.urlDisplay(response.urls)
    }
  },

  urlsScan: function(urls) {
    this.sendSocketNotification("URL_DETAIL", urls[this.pos])
  },

  urlDisplay: function (url) {
    var self = this
    var iframe = document.getElementById("A2D_OUTPUT")
    log("[A2D] Showing", url)
    iframe.src = "http://127.0.0.1:8080/A2D" //url[this.pos]
    iframe.addEventListener("load", function () {
      log("[A2D] URL Loaded")

     // if (this.pos ==(url.length-1)){
        setTimeout( () => {
          self.hideDisplay(true)
        }, self.config.displayDelay)
      //} else {
       // setTimeout( () => {
       //   self.pos++
       //    self.urlDisplay(url)
       // }, self.config.displayDelay)
     // }

    })
  },

  showDisplay: function() {
    log("[A2D] Show Iframe")
    var winh = document.getElementById("A2D")
    winh.classList.remove("hidden")
  },

  prepareDisplay: function (response) {
    console.log("[A2D] Prepare with", response)
    var self = this
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
        /* For later ...
        word[item].addEventListener("click", function() {
          log("[A2D] Clicked", value)
          iframe.src = "http://localhost:8080/activatebytext/?query=" + value
          self.hideDisplay(true)
        });
        */
        wordbox.appendChild(word[item])
      }
    }
    log("[A2D] Prepare ok")
  },

  hideDisplay: function (send) {
    log("[A2D] Hide Iframe")
    var winh = document.getElementById("A2D")
    var tr = document.getElementById("A2D_TRANSCRIPTION")
    var iframe = document.getElementById("A2D_OUTPUT")
    var trysay = document.getElementById("A2D_TRYSAY")
    var wordbox = document.getElementById("A2D_WORDBOX")
    
    winh.classList.add("hidden")
    tr.innerHTML= ""
    if (!send) iframe.src= ""
    trysay.textContent = ""
    wordbox.innerHTML = ""
  },
});
