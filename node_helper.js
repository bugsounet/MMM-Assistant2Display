/** node helper **/

const request = require('postman-request');
const fs = require('fs')
const path = require("path")

var NodeHelper = require("node_helper")

var _log = function() {
  var context = "[A2D]"
  return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

module.exports = NodeHelper.create({

  start: function () {
    this.config = {}
    this.html = ""
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        this.initialize(payload)
        break
      case "URL_DETAIL":
        this.prepareURL(payload)
        break
    }
  },

  initialize: function(config) {
    this.config = config
    log(this.config)
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
  },

  prepareURL: function(url) {
    log("Prepare URL:", url)

    request({url: url, method: "GET"}, (error, response, body)=> {
      if (error) {
        console.log("[A2D] Cannot open URL:", url)
        // to do : 404.html
        //this.sendSocketNotification("A2D_READY", "404.html")
      } else {
        this.html = `
          <html>
            <head>
              <title>Web Server Assistant2Display</title>
            </head>
            <body>
              <div id="A2D_URL" style="position:absolute;left:0px;top:0px;width:100%;height:100%" onMouseover="scrollspeed=0" onMouseout="scrollspeed=cache">
               <iframe id="A2D_SRC" src=${url} align="center" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" width="100%" height=${this.config.displayHeight} style="padding: 0; margin: 0; border: 0;">
               </iframe>
              </div>
              <script type="text/javascript">
              var scrollspeed=cache= ${this.config.scrollSpeed}
              function initializeScroller(){
                iframe=document.getElementsByTagName("iframe")
                sH= iframe[0].scrollHeight
                console.log("[A2D] scrollHeight:", sH)

                dataobj= document.getElementById("A2D_URL")
                //document.all? document.all.datacontainer : 
                dataobj.style.top="5px"
                setTimeout("getdataheight()", ${this.config.scrollInitDelay})
              }

              function getdataheight(){
                thelength=sH
                if (thelength==0)
                setTimeout("getdataheight()",10)
                else
                scrollDiv()
              }

              function scrollDiv(){
                dataobj.style.top=parseInt(dataobj.style.top)-scrollspeed+"px"
                if (parseInt(dataobj.style.top)<thelength*(-1))
                dataobj.style.top="5px"
                setTimeout("scrollDiv()",40)
              }

              if (window.addEventListener)
                window.addEventListener("load", initializeScroller, false)
              else if (window.attachEvent)
                window.attachEvent("onload", initializeScroller)
              else
                window.onload=initializeScroller

              </script>
            </body>
          </html>`
        this.writeHTML(this.html)
      }
    })
  },

  preparePHOTO: function(photo) {
    // todo
  },

  writeHTML: function(html) {
    var filePath = path.resolve(__dirname, "html/", "A2D.html")
    log("WriteHTML:", filePath)

    writeThisHTML = fs.writeFile(filePath, html, (error) => {
      if (error) {
        log("HTML_CREATION_ERROR", error)
        //todo : error.html
        //this.sendSocketNotification("A2D_READY", "error.html")
      } else {
        log("HTML_CREATED")
        this.sendSocketNotification("A2D_READY", "A2D.html")
      }
    })
  },

});
