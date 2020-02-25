const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const cheerio = require("cheerio")
const urlParser = require("url-parse")

var targetDocumentURL = "https://en.wikipedia.org/wiki/Yoda"
var targetBaseURL = new urlParser(targetDocumentURL).origin


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
    axios.get(requested).then((result) => {
      const html = result.data
      const $ = cheerio.load(html)
      var title = $("title").text()
      $("title").text("PROXY:" + title)
      if ($("base")) {
        $("base").attr("href", targetBaseURL)
      } else {
        $("head").append(`<base href="${targetBaseURL}">`)
      }
      response.send($.html())
    })
  } else {
    // other resources
    axios.get(requested).then((result)=>{
      var contentType = result.headers["content-type"]
      console.log("TYPE", requested, contentType)
      if (contentType) {
        response.setHeader('content-type', contentType)
      } else {
        //
      }
      response.send(result.data)
    })
  }


})

app.set('port', process.env.PORT || 8080)
app.listen(app.get('port'), function () {
  console.log('Proxy listening ' + app.get('port'))
})
