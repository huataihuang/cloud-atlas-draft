var _ = require('lodash');
var cheerio = require('cheerio');

var convert = require('./utils/convert');


// parse a ul list and return list of chapters recursvely
function parseList($ul, $) {
	var articles = [];

	$ul.children("li").each(function() {
		var article = {};

		var $li = $(this);
		var $inner = $li.children("dl").children("dt");
		if ($inner.length == 0) $inner = $li.children("p");
		if ($inner.length == 0) $inner = $li;

		article.title = $inner.text();

		// Parse link
		var $a = $inner.children("a");
		if ($a.length > 0) {
			article.title = $a.first().text();
			article.path = $a.attr("href").replace(/\\/g, '/').replace(/^\/+/, '')
		}

		// Sub articles
		var $sub = $li.children("dl").children("dd").children("ul");
		article.articles = parseList($sub, $);

		articles.push(article);
	});

	return articles;
}

function parseSummary(src) {
    return parseEntries(src)
    .then(function(chapters) {
    	return {
	    	chapters: chapters
	    };
    });
}

function parseEntries (src) {
	return convert(src)
	.then(function(html) {
		var $ = cheerio.load(html);

	    var chapters = parseList($("ul").first(), $);
	    return chapters;
	});
}


function summaryToText(summary) {
    var bl = "\n";
    var content = "Summary"+bl+"============"+bl+bl;

    var _base = function(article) {
        if (article.path) {
            return "- `"+article.title+" <"+article.path+">`_";
        } else {
            return "- "+article.title;
        }
    };

    var convertArticle = function(article, d) {
        content = content + Array(4*d).join(" ") + _base(article)+bl;
        _.each(article.articles, function(_article) {
            convertArticle(_article, d + 1);
        });
    };

    _.each(summary.chapters, function(chapter) {
        convertArticle(chapter, 0);
    });

    content = content+bl;

    return content;
};


module.exports = parseSummary;
module.exports.entries = parseEntries;
module.exports.toText = summaryToText;
