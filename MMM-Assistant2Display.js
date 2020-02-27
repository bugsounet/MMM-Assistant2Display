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
    ui: "Classic2",
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
    this.pos = 0
    this.urls= ""
    this.timer = null
    this.displayResponse = new Display(this.config, (noti, payload=null) => { this.sendSocketNotification(noti, payload) })
  },

  getStyles: function() {
    return [
      "/modules/MMM-Assistant2Display/ui/" + this.config.ui + "/" + this.config.ui + ".css"
    ];
  },

  getScripts: function() {
    if (this.config.ui) {
      var ui = this.config.ui + "/" + this.config.ui + '.js'
      return [
       "/modules/MMM-Assistant2Display/components/display.js",
       "/modules/MMM-Assistant2Display/ui/" + ui
      ]
    }
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
      case "ASSISTANT_CONFIRMATION":
        clearTimeout(this.timer)
        this.pos = 0
        this.urls= null
        this.timer = null
        this.displayResponse.hideDisplay()
        this.sendSocketNotification("PROXY_CLOSE")
        break
      case "ASSISTANT2DISPLAY":
        A2D("Received:", payload)
        this.displayResponse.scan(payload)
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
