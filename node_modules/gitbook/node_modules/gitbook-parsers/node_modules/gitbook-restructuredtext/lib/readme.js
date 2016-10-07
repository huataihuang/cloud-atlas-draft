var _ = require('lodash');
var cheerio = require('cheerio');

var convert = require('./utils/convert');

function parseReadme(src) {
	return convert(src)
	.then(function(html) {
		var $ = cheerio.load(html);

	    return {
	        title: $("h1:first-child").text().trim(),
	        description: $("p").first().text().trim()
	    };
	});
}


// Exports
module.exports = parseReadme;
