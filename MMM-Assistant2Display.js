/** Assistant 2 Display **/
/** @bugsounet **/

var A2D_ = function() {
  var context = "[AMK2:ADDONS:A2D]";
  return Function.prototype.bind.call(console.log, console, context);
}()

var A2D = function() {
  //do nothing
}

Module.register("MMM-Assistant2Display",{
  defaults: {
    ui : "AMk2",
    debug:false,
    verbose: false,
    displayDelay: 30 * 1000,
    scrollSpeed: 15,
    scrollStart: 1000,
    proxyPort: 8081,
    sandbox: null
  },

  start: function () {
    self = this
    this.useA2D = false
    this.scanAMk2()
    this.config = Object.assign({}, this.default, this.config)
    this.helperConfig= {
      debug: this.config.debug,
      verbose: this.config.verbose,
      scrollSpeed: this.config.scrollSpeed,
      scrollStart: this.config.scrollStart,
      proxyPort: this.config.proxyPort,
      useA2D: this.useA2D
    }

    if (this.config.debug) A2D = A2D_
    this.displayResponse = new Display(this.config, (noti, payload=null) => { this.sendSocketNotification(noti, payload) })
  },

  getScripts: function() {
    this.uiAutoChoice()
    var ui = this.config.ui + "/" + this.config.ui + '.js'
    return [
       "/modules/MMM-Assistant2Display/components/display.js",
       "/modules/MMM-Assistant2Display/ui/" + ui
    ]
  },

  getStyles: function() {
    return [
      "/modules/MMM-Assistant2Display/ui/" + this.config.ui + "/" + this.config.ui + ".css"
    ];
  },

  suspend: function() {
    A2D("This module cannot be suspended.")
  },

  resume: function() {
    A2D("This module cannot be resumed.")
  },

  notificationReceived: function (notification, payload) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        if (this.useA2D) this.displayResponse.prepare()
        this.sendSocketNotification("INIT", this.helperConfig)
        break
      case "ASSISTANT_HOOK":
      case "ASSISTANT_CONFIRMATION":
        if (this.useA2D) {
          this.displayResponse.resetTimer()
          this.displayResponse.hideDisplay()
          this.sendSocketNotification("PROXY_CLOSE")
        }
        break
      case "ASSISTANT2DISPLAY":
        if (this.useA2D) this.displayResponse.start(payload)
        break
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "A2D_READY":
        this.displayResponse.urlDisplay()
        break
    }
  },

  scanAMk2: function() {
    for (let [item, value] of Object.entries(config.modules)) {
      if (value.module == "MMM-AssistantMk2") {
        this.useA2D = value.config.addons ? value.config.addons : false
      }
    }
  },

  uiAutoChoice: function() {
    if (this.config.ui == "AMk2") {
      var modify = false
      for (let [item, value] of Object.entries(config.modules)) {
        if (value.module == "MMM-AssistantMk2") {
          if (value.config.ui && ((value.config.ui === "Classic2") || (value.config.ui === "Classic"))) {
            this.config.ui = value.config.ui
            modify = true
          } else {
            this.config.ui = "Fullscreen"
            modify = true
          }
        }
      }
      if (!modify) {
        console.log("[AMK2:ADDONS:A2D][ERROR] AMk2 not found!")
        this.config.ui = "Fullscreen"
      }
    }
    console.log("[AMK2:ADDONS:A2D] Auto choice UI", this.config.ui)
  },
});
