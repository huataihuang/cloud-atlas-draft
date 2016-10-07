var fs = require('fs');
var path = require('path');
var assert = require('assert');

var readme = require('../').readme;

describe('Readme parsing', function () {
    var LEXED;

    before(function(done) {
        var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/README.rst'), 'utf8');

        qdone(readme(CONTENT)
        .then(function(lexed) {
            LEXED = lexed;
        }), done);
    });

    it('should contain a title', function() {
        assert(LEXED.title);
    });

    it('should contain a description', function() {
        assert(LEXED.description);
    });

    it('should extract the right title', function() {
        assert.equal(LEXED.title, "This is the title");
    });

    it('should extract the right description', function() {
        assert.equal(LEXED.description, "This is the book description.");
    });
});
