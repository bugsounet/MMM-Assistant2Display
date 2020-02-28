/** Assistant 2 Display **/
/** @bugsounet **/

// todo:
//    * photo management
//    * ignore youtube links

var A2D_ = function() {
  var context = "[A2D]";
  return Function.prototype.bind.call(console.log, console, context);
}()

var A2D = function() {
  //do nothing
}

Module.register("MMM-Assistant2Display",{
  defaults: {
    ui : "AMk2",
    debug:true,
    verbose: false,
    displayDelay: 30 * 1000,
    scrollSpeed: 15,
    scrollStart: 1000,
    proxyPort: 8081
  },

  start: function () {
    self = this;
    this.config = Object.assign({}, this.default, this.config)
    if (this.config.debug) A2D = A2D_
    this.displayResponse = new Display(this.config, (noti, payload=null) => { this.sendSocketNotification(noti, payload) })
  },

  uiAutoChoice: function() {
    if (this.config.ui == "AMk2") {
      for (let [item, value] of Object.entries(config.modules)) {
        if (value.module == "MMM-AssistantMk2") {
          if (value.config.ui && ((value.config.ui === "Classic2") || (value.config.ui === "Classic"))) {
            this.config.ui = value.config.ui
          } else this.config.ui = "Fullscreen"
        }
      }
    }
    console.log("[A2D] Auto choice UI", this.config.ui)
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
        this.displayResponse.prepare()
        this.sendSocketNotification("INIT", this.config)
        break
      case "ASSISTANT_HOOK":
        A2D("Hooked")
      case "ASSISTANT_CONFIRMATION":
        this.displayResponse.resetTimer()
        this.displayResponse.hideDisplay()
        this.sendSocketNotification("PROXY_CLOSE")
        break
      case "ASSISTANT2DISPLAY":
        this.displayResponse.start(payload)
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

});
