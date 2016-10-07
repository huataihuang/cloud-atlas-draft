var nunjucks = require("nunjucks");
var assert = require("assert");
var AutoEscapeExtension = require("../")(nunjucks);


describe('Autoescape', function () {
    var env = new nunjucks.Environment([], {
        autoescape: true
    });

    it('should correctly be added as an extension', function() {
        env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(env));
    });

    it('should correctly disable autoescape', function() {
        assert.equal(
            env.renderString("{% autoescape false %}{{ test }}{% endautoescape %}", { test: "<b>test</b>"}),
            "<b>test</b>"
        );
    });

    it('should correctly toggle autoescape', function() {
        assert.equal(
            env.renderString("{% autoescape false %}{{ test }}{% autoescape true %}{{ test2 }}{% endautoescape %}{% endautoescape %}", {
                test: "<b>test</b>",
                test2: "<b>test2</b>"
            }),
            "<b>test</b>&lt;b&gt;test2&lt;/b&gt;"
        );
    });
});
