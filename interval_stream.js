"use strict";

module.exports = IntervalStream

var through2 = require("through2")

function IntervalStream(options, fn, interval) {
  if (!(this instanceof IntervalStream)) {
    return new IntervalStream(options, fn, interval)
  }

  if (typeof options === "function") {
    interval = fn
    fn = options
  }
  if (interval == null || fn == null) {
    throw new Error("need fn and interval")
  }

  var stream = through2(options)
  setInterval(function () {
    stream.write(fn())
  }, interval)
  return stream
}
