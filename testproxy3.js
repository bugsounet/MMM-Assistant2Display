const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const cheerio = require("cheerio")
const urlParser = require("url-parse")

//var targetDocumentURL = "https://en.wikipedia.org/wiki/Yoda"
var targetDocumentURL = "https://fr.wikipedia.org/wiki/Yoda"
var targetBaseURL = new urlParser(targetDocumentURL).origin

var htmlToAdd = `<script type="text/javascript">
var posY = 0

function loadCallback(){
  var d = document.getElementsByTagName('body')[0]
  var my = d.scrollHeight
  console.log("my:", my)

  window.setTimeout(function(){
    if (posY < my) {
      Scroll(0, posY);
      posY = posY + 2
      console.log("x:", posY)
      loadCallback();
    }
    else console.log("END")
  }, 10);
}
 
// Scroll X
function Scroll(x, y){
    window.scrollTo(x, y);
}
if (window.addEventListener)
  window.addEventListener("load", loadCallback, false)
else if (window.attachEvent)
  window.attachEvent("onload", loadCallback)
else
  window.onload=loadCallback

</script>`
              

var app = express()
app.use(bodyParser.json())
app.get("*", function (request, response) {
  var requested = request.originalUrl

  var isAbsolute = /\/http[s]?\:\/\/[^\/]+\//.exec(requested)
  if (isAbsolute) {
    requested = requested.slice(1)
  } else {
    requested = targetBaseURL + requested
  }
  console.log("REQUESTED:", requested)
  if (requested == targetDocumentURL) {
    // main html page
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
        addScript.append(htmlToAdd)
        //var addDivFirst= $("body")
        //addDivFirst.before("<div>")// to see
        //addDivFirst.after("</div>")
        response.send($.html())
      })
      .catch(function (error) {
        console.log("ERROR: " + error.message);
        response.send(error.message)
      })
  } else {
    // other resources
    axios.get(requested)
      .then((result)=>{
        var contentType = result.headers["content-type"]
        console.log("TYPE", requested, contentType)
        if (contentType) {
          response.setHeader('content-type', contentType)
        } else {
         //
        }
        response.send(result.data)
      })
      .catch(function (error) {
        if (error.response) {
          console.log("ERROR: " + error.response.status + " - URL: " + error.config.url)
        } else if (error.request) {
          console.log("Error Request", error.request);
        } else {
          console.log('Error', error.message);
        }
        response.send(error.message)
      })      
  }
  

})

app.set('port', process.env.PORT || 8080)
app.listen(app.get('port'), function () {
  console.log('Proxy listening ' + app.get('port'))
  
})
