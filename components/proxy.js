/** Proxy for A2D **/
/** eouia & bugsounet **/

const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const cheerio = require("cheerio")
const urlParser = require("url-parse")
var app = express()

var _log = function() {
    var context = "[A2D:PROXY]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

var logv = function() {
  //do nothing
}

class PROXY {
  constructor(config, callback = ()=>{}) {
    this.config = config
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    var verbose = (this.config.verbose) ? this.config.verbose : false
    if (verbose == true) logv= _log
    this.server = null
    this.callback= callback
    this.script = `<script type="text/javascript">
// A2D auto scrolling by bugsounet

function scrollDown(posY){
  var body = document.getElementsByTagName('body')[0]
  var scrollHeight = body.scrollHeight

  window.setTimeout(function(){
    if (posY == 0) console.log("[A2D:PROXY] Begin Scrolling")
    if (posY < scrollHeight) {
      window.scrollTo(0, posY);
      posY++
      scrollDown(posY);
    }
    else console.log("[A2D:PROXY] End Scrolling")
  }, ${this.config.scrollSpeed});
}

if (window.addEventListener)
  window.addEventListener("load", () => {
    setTimeout("scrollDown(0)", ${this.config.scrollStart})
  }, false)

</script>
`
  }

  start (url) {
    log("Initialize for request: " + url)
    var self = this
    var targetDocumentURL = url
    var targetBaseURL = new urlParser(targetDocumentURL).origin
    app = express()
    app.use(bodyParser.json())
    app.get("*", function (request, response) {
      var requested = request.originalUrl
      var isAbsolute = /\/http[s]?\:\/\/[^\/]+\//.exec(requested)
      if (isAbsolute) {
        requested = requested.slice(1)
      } else {
        requested = targetBaseURL + requested
      }
      logv("REQUESTED:", requested)
      if (requested == targetDocumentURL) {
        response.header("Access-Control-Allow-Origin", "*")
        response.header("Access-Control-Allow-Methods", "GET")
        response.header("Access-Control-Allow-Headers", request.header('access-control-request-headers'))
        axios.get(requested)
          .then((result) => {
            const html = result.data
            const $ = cheerio.load(html)
            var title = $("title").text()
            $("title").text("Assistant2Display: " + title)
            if ($("base")) {
              $("base").attr("href", targetBaseURL)
            } else {
              $("head").append(`<base href="${targetBaseURL}">`)
            }
            var addScript = $("head")
            addScript.append(self.script)
            response.send($.html())
          })
          .catch(function (error) {
            console.log("[A2D:PROXY] ERROR: " + error.message);
            response.send(error.message)
          })
      } else {
        // other resources
        axios.get(requested)
          .then((result)=>{
            var contentType = result.headers["content-type"]
            logv("TYPE", requested, contentType)
            if (contentType) {
              response.setHeader('content-type', contentType)
            } else {
             //
            }
            response.send(result.data)
          })
          .catch(function (error) {
            if (error.response) {
              log("ERROR: " + error.response.status + " - URL: " + error.config.url)
            } else if (error.request) {
              log("Error Request: " + error.request);
            } else {
              log('Error: ' + error.message);
            }
            response.send(error.message)
          })    
      }
    })
    log("Initialized")
    app.set('port', this.config.proxyPort)
    this.server = app.listen(app.get('port'), function () {
      log('Proxy Start listening ' + app.get('port'))
      self.callback("A2D_READY")
    })
  }

  stop () {
    if (!this.server) return log("Not Running")
    this.server.close()
    log('Proxy Stop listening')
    this.server = null
  }

}

module.exports = PROXY
