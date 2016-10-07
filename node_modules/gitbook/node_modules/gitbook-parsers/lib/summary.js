var _ = require("lodash");
var url = require("url");
var path = require("path");

// Is the link an external link
var isExternal = function(href) {
    try {
        return Boolean(url.parse(href).protocol);
    } catch(err) { }

    return false;
};

function defaultChapterList(chapterList, options) {
    // Check if introduction node was specified in SUMMARY.md
    var hasIntro = _.find(chapterList, function(entry) {
        return normalizePath(entry.path) == normalizePath(options.entryPoint);
    });

    if (hasIntro) return chapterList;

    // It wasn't specified, so add in default
    return [
        {
            path: options.entryPoint,
            title: options.entryPointTitle
        }
    ].concat(chapterList);
}

// Normalize path
// 1. Convert Window's "\" to "/"
// 2. Remove leading "/" if exists
function normalizePath(p) {
    if (!p) return p;
    return path.normalize(p).replace(/\\/g, '/').replace(/^\/+/, '');
}

function normalizeChapters(chapterList, options, level, base, paths) {
    base = base || 0;
    paths = paths || {};

    var i = base;

    return _.chain(chapterList)
        .map(function(chapter) {
            chapter.path = normalizePath(chapter.path);

            // Ignore multiple entries with same filename
            if (chapter.path){
                if(paths[chapter.path]) return null;
                paths[chapter.path] = true;
            }

            chapter.level = (level? [level || "", i] : [i]).join(".");
            chapter.external = isExternal(chapter.path);
            chapter.exists = chapter.path? (
                chapter.external ||
                !options.files ||
                !!_.find(options.files, function(f) { return normalizePath(f) == chapter.path; })
            ) : false;

            i = i + 1;
            return {
                path: chapter.path,
                title: chapter.title.trim(),
                level: chapter.level,
                articles: normalizeChapters(chapter.articles || [], options, chapter.level, 1, paths),
                exists: chapter.exists,
                external: chapter.external,
                introduction: chapter.path == options.entryPoint
            };
        })
        .compact()
        .value();
};


function normalizeSummary(summary, options) {
    options = _.defaults(options || {}, {
        entryPoint: "README.md",
        entryPointTitle: "Introduction",
        files: null
    })

    if (_.isArray(summary)) summary = { chapters: summary };
    summary.chapters = defaultChapterList(summary.chapters, options);
    summary.chapters = normalizeChapters(summary.chapters, options);
    return summary;
};

module.exports = {
    normalize: normalizeSummary
};
