/** node helper **/

const request = require("request")
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const readability = require("./readability/Readability.js")
const bodyParser = require("body-parser")
var NodeHelper = require("node_helper")
//const helmet = require('helmet')
const frameguard = require('frameguard')

/** SCRIPT NOT CLEANED MOUAHAHAH, it's a mess !!!! **/

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
    this.detail = ""
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

  initialize: function() {
 // do nothing actually
  },

  prepareURL: function(url) {
    console.log("[A2D] Prepare", url)

    request({url: url, method: "GET"}, (error, response, body)=> {
      if (error) {
        console.log("[A2D] Cannot open URL :", url)
      } else {
        this.detail = `      
<html>
  <head>
    <title>Web Server Assistant2Display</title>
  </head>
  <body>
    <div id="A2D_URL" style="position:absolute;left:0px;top:0px;width:100%;height:100%" onMouseover="scrollspeed=0" onMouseout="scrollspeed=cache">
     <iframe id="A2D_SRC" src=${url} align="center" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" width="100%" height="20000" style="padding: 0; margin: 0; border: 0;">
     </iframe>
    </div>
    <script type="text/javascript">
    //speed of scroll. Larger=faster (ie: 5)
    var scrollspeed=cache=2 // I Will make value with config
    //Specify intial delay before scroller starts scrolling (in miliseconds):
    var initialdelay=500
    function initializeScroller(){
      xx=document.getElementsByTagName("iframe")
      YY= xx[0].scrollHeight
      console.log("scrollHeight", YY)
      xx.height = YY

      dataobj=document.all? document.all.datacontainer : document.getElementById("A2D_URL")
      dataobj.style.top="5px"
      setTimeout("getdataheight()", initialdelay)
    }

    function getdataheight(){
      thelength=YY
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
        this.serveDetail()
      }
    })
  },

// to try: write the html file in A2D path and call it directly in MMM core
// maybe works without frameguard !?
  serveDetail: function() {
    this.expressApp.use(frameguard({ action: 'ALLOW-FROM', domain: 'http://localhost' }));
    this.expressApp.get("/A2D", (req, res) => {
      var html = this.detail
      res.status(200).send(html)
      console.log("[A2D] HTML Sended")
    })
    this.sendSocketNotification("A2D_READY")
    console.log("[A2D] Served with /A2D")
  },
});
