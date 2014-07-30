// allow connections from sensorbox

// serve page w/ browserified content

// relay data when received from client

// allow range query from client
"use strict";

var http = require("http")
var ecstatic = require("ecstatic")

http.createServer(
  ecstatic({ root: __dirname + "/site" })
).listen(8080)

console.log("Listening on :8080")
