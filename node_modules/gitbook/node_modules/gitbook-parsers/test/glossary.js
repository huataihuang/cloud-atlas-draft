var _ = require('lodash');
var assert = require('assert');

var glossaryUtils = require('../lib/glossary');

describe('Glossary normalization', function () {
    var glossary = glossaryUtils.normalize([
        {
            name: "Babar",
            description: "Babar is an elephant"
        },
        {
            name: "Test",
            description: "Just a test"
        },
        {
            name: "Abracadabra",
            description: "This is magic!"
        },
        {
            name: "amour",
            description: "This is love!"
        }
    ]);

    it('should return all necessary properties', function() {
        _.each(glossary, function(entry) {
            assert(entry.name);
            assert(entry.description);
            assert(entry.id);
        });
    });

    it('should correctly sort entries', function() {
        assert.equal(glossary[0].name, "Abracadabra");
        assert.equal(glossary[1].name, "amour");
        assert.equal(glossary[2].name, "Babar");
        assert.equal(glossary[3].name, "Test");
    });

    it('should correctly normalize id', function() {
        assert.equal(glossary[0].id, "abracadabra");
        assert.equal(glossary[1].id, "amour");
        assert.equal(glossary[2].id, "babar");
        assert.equal(glossary[3].id, "test");
    });
});
