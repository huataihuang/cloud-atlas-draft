var fs = require('fs');
var path = require('path');
var assert = require('assert');

var glossary = require('../').glossary;

describe('Glossary parsing', function () {
	var LEXED;

	before(function(done) {
		var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/GLOSSARY.rst'), 'utf8');

		qdone(glossary(CONTENT)
		.then(function(lexed) {
			LEXED = lexed;
		}), done);
	});

    it('should only get heading + paragraph pairs', function() {
        assert.equal(LEXED.length, 5);
    });

    it('should output simple name/description objects', function() {
        assert.equal(true, !(LEXED.some(function(e) {
            return !Boolean(e.name && e.description);
        })));
    });

    it('should correctly convert it to text', function(done) {
        var text = glossary.toText(LEXED);

        qdone(glossary(text)
        .then(function(lexed) {
            assertObjectsEqual(lexed, LEXED);
        }), done);
    });
});
