var _ = require('lodash');
var assert = require('assert');

var langsUtils = require('../lib/langs');

describe('Languages normalization', function () {
    var langs = langsUtils.normalize([
        {
            title: "French"
        },
        {
            title: "English",
            path: "en/"
        },
        {
            title: "German",
            path: "./de"
        }
    ]);

    it('should filter entries without path', function() {
        assert(langs.length == 2);
    });

    it('should return all necessary properties', function() {
        _.each(langs, function(lang) {
            assert(lang.title);
            assert(lang.path);
            assert(lang.lang);
        });
    });

    it('should correctly normalize lang', function() {
        assert.equal(langs[0].lang, "en");
        assert.equal(langs[1].lang, "de");
    });
});
