var Q = require("q");
var tmp = require("tmp");
var fs = require("fs");
var cheerio = require('cheerio');
var exec = require('child_process').exec;

var convert = function(content) {
    return Q.all([
    	Q.nfcall(tmp.file.bind(tmp), { postfix: ".rst" }).get(0),
    	Q.nfcall(tmp.tmpName.bind(tmp), { postfix: ".rst" }),
    ])
    .spread(function(rstFile, htmlfile) {
    	// Write rst
    	fs.writeFileSync(rstFile, content);

    	var command = "rst2html.py "+rstFile+" "+htmlfile;

    	return Q.nfcall(exec, command).thenResolve(htmlfile)
    })
    .then(function(htmlfile) {
    	return Q.nfcall(fs.readFile, htmlfile, {encoding: "utf-8"});
    })
    .then(function(html) {
        var $ = cheerio.load(html);
        return $("body .document").html();
    });
};

module.exports = convert;
