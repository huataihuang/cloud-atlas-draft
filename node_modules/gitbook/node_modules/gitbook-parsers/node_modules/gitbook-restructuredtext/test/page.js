var fs = require('fs');
var path = require('path');
var assert = require('assert');

var page = require('../').page;

describe('Page parsing', function() {
	var LEXED;

	before(function(done) {
		var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/PAGE.rst'), 'utf8');

		qdone(page(CONTENT)
		.then(function(lexed) {
			LEXED = lexed.sections;
		}), done);
	});

    it('should detect sections', function() {
        assert.equal(LEXED.length, 1);
    });

    it('should gen content for normal sections', function() {
        assert(LEXED[0].content);
    });
});
