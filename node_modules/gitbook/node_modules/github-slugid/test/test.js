var slug = require('../');
var should = require('should');

describe('slug', function () {
    it('should replace whitespaces', function() {
        slug('hello').should.equal('hello');
        slug('hello world').should.equal('hello-world');
    });

    it('should replace with lowercase', function() {
        slug('Hello World').should.equal('hello-world');
    });

    it('should remove leading separator', function() {
        slug('!weird + id/for headings').should.equal('weird--idfor-headings');
    });

    it('should accept chinese', function() {
        slug('您好').should.equal('您好');
    });

    it('should remove symbols', function() {
        slug('I ♥ you').should.equal('i--you');
        slug('a > b').should.equal('a--b');
    });

    it('should follow github', function() {
        slug('Schöner Titel läßt grüßen!? Bel été !').should.equal('schöner-titel-läßt-grüßen-bel-été-');
    })
});

