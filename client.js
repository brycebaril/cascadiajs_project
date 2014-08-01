// instntiate graphs w/ different query functions


var TsDB = require("timestreamdb")
var level = require("level-js")

var orig = level("foo", {valueEncoding: "json"})
var db = TsDB(orig)

var shoe = require("shoe")

var upstream = shoe("/replicate")
upstream.pipe(orig.createWriteStream())

var d1 = [];
for (var i = 0; i < 14; i += 0.5) {
  d1.push([i, Math.sin(i)]);
}

var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];

// A null signifies separate line segments

var d3 = [[0, 12], [7, 12], null, [7, 2.5], [12, 2.5]];

// function insertGraph(id) {
//   var newgraph = document.createElement("div")
//   newgraph.id = id
//   newgraph.className = "graph"
//   $(".container").append(newgraph)
//   $.plot("#" + id, [d1, d2, d3])
// }
//
// insertGraph("abc")
// insertGraph("def")
// insertGraph("qyx")
// insertGraph("lll")
//
//
// $(".container").isotope({
//   itemSelector: ".graph",
// })

$.plot("#r1c1", [d1])
$.plot("#r1c2", [d1])
$.plot("#r1c3", [d1])

$.plot("#r2c1", [d1])
$.plot("#r2c2", [d1])
$.plot("#r2c3", [d1])

$.plot("#r3c1", [d1])
$.plot("#r3c2", [d1])
$.plot("#r3c3", [d1])
