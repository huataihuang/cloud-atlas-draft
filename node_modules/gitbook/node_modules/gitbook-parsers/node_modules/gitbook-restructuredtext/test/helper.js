var assert = require("assert");

global.assertObjectsEqual = function(o1, o2) {
    assert.equal(JSON.stringify(o1, null, 4), JSON.stringify(o2, null, 4));
};

// Nicety for mocha / Q
global.qdone = function qdone(promise, done) {
    return promise.then(function() {
        return done();
    }, function(err) {
        return done(err);
    }).done();
};


