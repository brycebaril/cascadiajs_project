"use strict";

var Gpio = require("onoff").Gpio
var AnalogIn = require("analogin")
var level = require("level-hyper")
var TsDB = require("timestreamdb")
var timestream = require("timestream")
var IntervalStream = require("./interval_stream")
var multibuffer = require("multibuffer")

var http = require("http")
var ecstatic = require("ecstatic")
var shoe = require("shoe")

var server = http.createServer(
  ecstatic({ root: __dirname + "/site" })
).listen(8080)

console.log("HTTP Listening on :8080")

var downstream
var sock = shoe(function (stream) {
  downstream = stream
})
sock.install(server, "/replicate")

var COLLECTION_INTERVAL = 50

// Set up db
var orig = level("./db", {valueEncoding: "json"})
var db = TsDB(orig)

// Set up replication switch
var redLed = new Gpio("44", "out")
function lightRed(val) {
  redLed.writeSync(val)
}
var redSwitch = new Gpio("45", "in", "both")

var redState = redSwitch.readSync()
lightRed(redState)

redSwitch.watch(function (err, value) {
  if (value) {
    redState = 1
    startReplication()
  }
  else {
    redState = 0
    stopReplication()
  }
  lightRed(redState)
})

function startReplication() {
  console.log("Starting replication")
}

function stopReplication() {
  console.log("Stopping replication")
}

// Set up data switches (incrementers)
var yellowPresses = 0
var greenPresses = 0

// yellow is always on
var yellowLed = new Gpio("26", "out")
yellowLed.writeSync(1)
var yellowBtn = new Gpio("23", "in", "rising")

yellowBtn.watch(function (err, val) {
  yellowPresses++
})

// green is always on
var greenLed = new Gpio("46", "out")
greenLed.writeSync(1)
var greenBtn = new Gpio("47", "in", "rising")
greenBtn.watch(function (err, value) {
  greenPresses++
})


// Set up analog inputs
var photo = AnalogIn(1)
var x = AnalogIn(0)
var y = AnalogIn(2)
var z = AnalogIn(6)

function collect() {
  var record = {
    _t: Date.now(),
    yellow: yellowPresses,
    green: greenPresses,
    red: redState,
    photo: photo.readSync(),
    accel: {
      x: x.readSync(),
      y: y.readSync(),
      z: z.readSync()
    }
  }
  yellowPresses = 0
  greenPresses = 0
  // db.put("cjs", record)
  // //console.log(record)
  return record
}

var readstream = new IntervalStream({objectMode: true}, collect, COLLECTION_INTERVAL)
var ts = timestream(readstream)
  .flatten()
  .mean(1000)
  .tail(function (record) {
    db.put("cjs", record, {version: record._t})
    if (redState && downstream) {
      downstream.write(multibuffer.pack([Buffer(record._t.toString()), Buffer(JSON.stringify(record))]))
    }
  })
