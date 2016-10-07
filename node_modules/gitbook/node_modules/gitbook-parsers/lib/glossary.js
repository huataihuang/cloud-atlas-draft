var _ = require("lodash");

// Normalize glossary
function normalize(glossary) {
    return _.chain(glossary)
        .map(function(entry) {
            entry.id = entryId(entry.name);
            return entry;
        })
        .sortBy(function(entry) {
            return entry.name.toLowerCase();
        })
        .value();
}

// Normalizes a glossary entry's name to create an ID
function entryId(name) {
    return name.toLowerCase()
        .replace(/[\/\\\?\%\*\:\;\|\"\'\\<\\>\#\$\(\)\!\.\@]/g, '')
        .replace(/ /g, '_')
        .trim();
}

module.exports = {
    entryId: entryId,
    normalize: normalize
};
