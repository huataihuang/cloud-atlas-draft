var fs = require('fs');
var path = require('path');
var assert = require('assert');

var langs = require('../').langs;

describe('Languages parsing', function () {
	var LEXED;

	before(function(done) {
		var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/LANGS.rst'), 'utf8');

		qdone(langs(CONTENT)
		.then(function(lexed) {
			LEXED = lexed;
		}), done);
	});

    it('should detect paths and titles', function() {
        assert.equal(LEXED[0].path,'en/');
        assert.equal(LEXED[0].title,'English');

        assert.equal(LEXED[1].path,'fr/');
        assert.equal(LEXED[1].title,'French');
    });

    it('should correctly convert it to text', function(done) {
        var text = langs.toText(LEXED);

        qdone(langs(text)
        .then(function(lexed) {
            assertObjectsEqual(lexed, LEXED);
        }), done);
    });
});
