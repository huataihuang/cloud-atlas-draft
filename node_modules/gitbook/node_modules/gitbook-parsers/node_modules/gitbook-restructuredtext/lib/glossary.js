var _ = require('lodash');
var cheerio = require('cheerio');

var convert = require('./utils/convert');

function parseGlossary(src) {
    return convert(src)
    .then(function(html) {
        var $ = cheerio.load(html);

        var entries = [];

        $("div.section").each(function() {
            var $section = $(this);
        	var $title = $section.find("h1");
            var $p = $section.find("p");

        	var entry = {};

        	entry.name = $title.text();
            entry.description = $p.text();

        	entries.push(entry);
        });

        return entries;
    });
}

function glossaryToText(glossary) {
    var bl = "\n";

    var body = _.map(glossary, function(entry) {
        return entry.name+bl+"***************"+bl+bl+entry.description;
    }).join(bl+bl);

    return "Glossary"+bl+"============"+bl+bl+body;
}

module.exports = parseGlossary;
module.exports.toText = glossaryToText;

