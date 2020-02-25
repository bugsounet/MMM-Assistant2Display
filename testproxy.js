

const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const cheerio = require("cheerio")

var testURL = "https://en.wikipedia.org/wiki/Yoda"
var baseURL = "https://en.wikipedia.org"


var app = express()
app.use(bodyParser.json())
app.get("/proxy", function(request, response) {
  response.header("Access-Control-Allow-Origin", "*")
  response.header("Access-Control-Allow-Methods", "GET")
  response.header("Access-Control-Allow-Headers", request.header('access-control-request-headers'))

  axios.get(testURL).then((result) =>{
    if (result.status == 200) {
      const html = result.data
      const $ = cheerio.load(html)
      var title = $("title").text()
      $("title").text("PROXY:" + title)
      if ($("base")) {
        $("base").attr("href", baseURL)
      } else {
        $("head").append(`<base href="https://en.wikipedia.org/">`)
      }
      $(`link[rel="stylesheet"]`).each(function(i, elm) {
        var old = $(this).attr("href")
        //check if old`href` is relative url (not implemented here.)
        $(this).attr("href", baseURL + old)
      })
      $(`script`).each(function(i, elm) {
        //check if old `src` is relative url (not implemented here.)
        var old = $(this).attr("src")
        if (old) $(this).attr("src", baseURL + old)
      })
      response.send($.html())
    } else {
      response.status(400).send()
    }
  })
})

app.set('port', process.env.PORT || 8080)
app.listen(app.get('port'), function () {
  console.log('Proxy listening ' + app.get('port'))
})
