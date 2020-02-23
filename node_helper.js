/** node helper **/

const request = require("request")
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const readability = require("./readability/Readability.js")
const bodyParser = require("body-parser")
var NodeHelper = require("node_helper")
//const helmet = require('helmet')
const frameguard = require('frameguard')


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
              <iframe sandbox="allow-same-origin allow-scripts" align="center" width="100%" height="100%" src="${url}" scrolling="yes" name="A2D" id="A2D_OUT">
              </iframe>';
            </body>
            </html>
          `
        this.serveDetail()
      }
    })
  },
  
  serveDetail: function() {
   // this.expressApp.use(bodyParser.json())
		//this.expressApp.use(bodyParser.urlencoded({extended: true}))
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
