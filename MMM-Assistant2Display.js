/** Assistant 2 Display **/
/** @bugsounet **/

// todo:
//    * timer management on new request -- done ?
//    * multi ui config by reading AMk2 config
//    * HelpWord display and click
//    * photo management

var A2D_ = function() {
  var context = "[A2D]";
  return Function.prototype.bind.call(console.log, console, context);
}()

var A2D = function() {
  //do nothing
}

Module.register("MMM-Assistant2Display",{
  defaults: {
    debug:true,
    verbose: false,
    displayDelay: 30 * 1000,
    //displayHelpWord: false
    scrollSpeed: 15,
    scrollStart: 1000,
    proxyPort: 8081
  },

  start: function () {
    self = this;
    this.config = Object.assign({}, this.default, this.config)
    if (this.config.debug) A2D = A2D_
    this.pos = 0
    this.urls= ""
    this.timer = null
  },

  getStyles: function() {
    return [
      "MMM-Assistant2Display.css",
    ];
  },

  suspend: function() {
    A2D("This module cannot be suspended.")
  },

  resume: function() {
    A2D("This module cannot be resumed.")
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
        this.sendSocketNotification("INIT", this.config)
        break
      case "ASSISTANT_CONFIRMATION":
        clearTimeout(this.timer)
        this.pos = 0
        this.urls= ""
        this.timer = null
        this.hideDisplay()
        this.sendSocketNotification("PROXY_CLOSE")
        break
      case "ASSISTANT2DISPLAY":
        log("Received:", payload)
        this.scan(payload)
        break
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "A2D_READY":
        this.urlDisplay(payload)
        break
    }
  },

  scan: function (response) {
    A2D("Scan",response)
    if(response.urls && response.urls.length > 0) {
      this.pos = 0
      this.urls= response.urls
      this.prepareDisplay(response)
      this.urlsScan(response.urls)
    }
  },

  urlsScan: function() {
    this.sendSocketNotification("URL_DETAIL", this.urls[this.pos])
  },

  urlDisplay: function (uri) {
    var self = this
    var iframe = document.getElementById("A2D_OUTPUT")
    A2D("Loading", this.urls[this.pos])
    this.showDisplay()
    iframe.src = "http://127.0.0.1:" + this.config.proxyPort + "/"+ this.urls[this.pos]
    iframe.addEventListener("load", function() {
      A2D("URL Loaded")
      self.timer = setTimeout( () => {
        self.sendSocketNotification("PROXY_CLOSE")
        if (self.pos >= (self.urls.length-1)){
          self.hideDisplay()
        } else {
          self.pos++
          self.urlsScan()
        }
      }, self.config.displayDelay)
    }, {once: true})
  },

  showDisplay: function() {
    A2D("Show Iframe")
    var winh = document.getElementById("A2D")
    winh.classList.remove("hidden")
  },

  prepareDisplay: function (response) {
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
  },

  hideDisplay: function () {
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
  },

});
