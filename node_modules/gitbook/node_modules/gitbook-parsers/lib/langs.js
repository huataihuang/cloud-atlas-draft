var _ = require("lodash");
var path = require("path");

// Normalize langs
function normalize(entries) {
    return _.chain(entries)
        .filter(function(entry) {
            return Boolean(entry.path);
        })
        .map(function(entry) {
            return {
                title: entry.title.trim(),
                path: entry.path,
                lang: path.basename(entry.path)
            };
        })
        .value();
}

module.exports = {
    normalize: normalize
};
