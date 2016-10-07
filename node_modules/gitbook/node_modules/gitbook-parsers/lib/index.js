var Q = require("q");
var _ = require("lodash");
var path = require("path");

var summaryUtils = require("./summary");
var glossaryUtils = require("./glossary");
var langsUtils = require("./langs");

// This list is ordered by priority of parsers to use
var PARSERS = _.chain([
        {
            name: "markdown",
            extensions: [".md", ".markdown", ".mdown"],
            parser: require("gitbook-markdown")
        },
        {
            name: "asciidoc",
            extensions: [".adoc", ".asciidoc"],
            parser: require("gitbook-asciidoc")
        },
        {
            name: "restructuredtext",
            extensions: [".rst"],
            parser: require("gitbook-restructuredtext")
        }
    ])
    .map(function(type) {
        if (!type.parser || !type.parser.summary || !type.parser.page
            || !type.parser.glossary || !type.parser.readme) {
            return null;
        }

        return composeType(type);
    })
    .compact()
    .value();

// Wrap Q
function wrapQ(func) {
    return _.wrap(func, function(_func) {
        var args = Array.prototype.slice.call(arguments, 1);
        return Q()
        .then(function() {
            return _func.apply(null, args)
        })
    });
}

// Prepare and compose a parser
function composeType(type) {
    var parser = type.parser;
    var nparser = {
        name: type.name,
        extensions: type.extensions
    };

    nparser.glossary = wrapQ(_.compose(glossaryUtils.normalize, parser.glossary))
    nparser.glossary.toText = wrapQ(parser.glossary.toText);

    var oldSummaryParser = wrapQ(parser.summary);
    nparser.summary = function(src, options) {
        return oldSummaryParser(src)
        .then(function(summary) {
            return summaryUtils.normalize(summary, options);
        });
    };
    nparser.summary.toText = wrapQ(parser.summary.toText);

    nparser.langs = wrapQ(_.compose(langsUtils.normalize, parser.langs));
    nparser.langs.toText = wrapQ(parser.langs.toText);

    nparser.readme = wrapQ(parser.readme);

    nparser.page = wrapQ(parser.page);
    nparser.page.prepare = wrapQ(parser.page.prepare || _.identity);

    return nparser;
};

// Return a specific parser according to an extension
function getParser(ext) {
    return _.find(PARSERS, function(input) {
        return input.name == ext || _.contains(input.extensions, ext);
    });
}

// Return parser for a file
function getParserForFile(filename) {
    return getParser(path.extname(filename));
};

module.exports = {
    all: PARSERS,
    extensions: _.flatten(_.pluck(PARSERS, "extensions")),
    get: getParser,
    getForFile: getParserForFile,
    glossary: {
        entryId: glossaryUtils.entryId
    }
};
