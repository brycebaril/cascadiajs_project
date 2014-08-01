var timestream = require("timestream")
var through2 = require("through2")
var level = require("level-js")
var terminus = require("terminus")
var multibuffer = require("multibuffer")
var xtend = require("xtend")

var orig = level("foo", {valueEncoding: "json"})
var db = TsDB(orig)

var shoe = require("shoe")

var DEFAULT_OPTS = {
  xaxis: {
    mode: "time",
  }
}

var upstream = through2.obj()
var tstream = timestream(upstream)

tstream.keep(["photo"])
  .pipe(graphStream("#r1c1", xtend(DEFAULT_OPTS, {})))

// TODO scale?
tstream.keep(["accel.x", "accel.y", "accel.z"])
  .pipe(graphStream("#r1c2", xtend(DEFAULT_OPTS, {})))

tstream.keep(["yellow", "green", "red"])
  .pipe(graphStream("#r1c3", xtend(DEFAULT_OPTS, {})))

tstream.keep(["photo"])
  .sma(10)
  .pipe(graphStream("#r2c1", xtend(DEFAULT_OPTS, {})))

tstream.keep(["accel.x", "accel.y", "accel.z"])
  .sma(10)
  .pipe(graphStream("#r2c2", xtend(DEFAULT_OPTS, {})))

tstream.keep(["yellow", "green", "red"])
  .sum(1000)
  .pipe(graphStream("#r2c3", xtend(DEFAULT_OPTS, {})))

tstream.keep(["photo"])
  .dt()
  .dt()
  .pipe(graphStream("#r3c1", xtend(DEFAULT_OPTS, {})))

tstream.keep(["accel.x", "accel.y", "accel.z"])
  .dt()
  .dt()
  .pipe(graphStream("#r3c2", xtend(DEFAULT_OPTS, {})))

tstream.keep(["yellow", "green", "red"])
  .dt()
  .dt()
  .pipe(graphStream("#r3c3", xtend(DEFAULT_OPTS, {})))


// timestreamdb broken in the browser? just pretend for now?
var upstream = shoe("/replicate")
upstream.pipe(terminus.tail(function (mb) {
  var parts = multibuffer.unpack(mb)
  var version = parseInt(parts[0].toString())
  var record = JSON.parse(parts[1].toString())
  upstream.write(record)
}))

function graphStream(id, options) {
  var records = []
  var plot = function () {
    if (records.length) {
      $.plot(id, records, options)
    }
  }
  var graphStream = terminus.tail({objectMode: true}, function (record) {
    records.push([record._t, record])
    plot()
  })
  return graphStream
}
