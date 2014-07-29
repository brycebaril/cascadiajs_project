"use strict";

var Gpio = require("onoff").Gpio
var AnalogIn = require("analogin")
var level = require("level-hyper")
var TsDB = require("timestreamdb")

var COLLECTION_INTERVAL = 50

// Set up db
var orig = level("./db", {valueEncoding: "json"})
var db = TsDB(orig)

// Set up replication switch
var redState

var redLed = new Gpio("44", "out")
var redSwitch = new Gpio("45", "in", "both")

redSwitch.watch(function (err, value) {
  if (value) {
    console.log("red switch is true")
    startReplication()
  }
  else {
    console.log("red switch is false")
    stopReplication()
  }
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
var yellowBtn = new Gpio("23", "in", "rising")

yellowBtn.watch(function (err, val) {
  yellowPresses++
})

// green is always on
var greenLed = new Gpio("46", "out")
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
  db.put("cjs", record)
}

setInterval(collect, COLLECTION_INTERVAL)
