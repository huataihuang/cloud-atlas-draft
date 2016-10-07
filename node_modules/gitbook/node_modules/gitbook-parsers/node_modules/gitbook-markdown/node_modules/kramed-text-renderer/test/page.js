var fs = require('fs');
var path = require('path');
var assert = require('assert');

var kramed = require('kramed');

var renderer = require('../');


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/PAGE.md'), 'utf8');
var LEXED = kramed.lexer(CONTENT);

// Options to parser
var options = Object.create(kramed.defaults);
options.renderer = renderer();

var RENDERED = kramed.parser(LEXED, options);


describe('Text renderer', function() {
    it('should strip all html tags', function() {
        assert.equal(RENDERED.indexOf('</'), -1);
        console.log(RENDERED);
    });
});
