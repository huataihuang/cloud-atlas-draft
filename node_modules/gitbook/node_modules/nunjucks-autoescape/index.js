module.exports = function(nunjucks) {
    return function AutoEscapeExtension(_env) {
        this.tags = ['autoescape'];

        this.parse = function(parser, nodes, lexer) {
            // get the tag token
            var tok = parser.nextToken();

            // parse the args and move after the block end. passing true
            // as the second arg is required if there are no parentheses
            var args = parser.parseSignature(null, true);
            parser.advanceAfterBlockEnd(tok.value);

            // parse the body and possibly the error block, which is optional
            var body = parser.parseUntilBlocks('endautoescape');

            parser.advanceAfterBlockEnd();

            // See above for notes about CallExtension
            return new nodes.CallExtension(this, 'run', args, [body]);
        };

        this.run = function(context, mode, body) {
            var opts = _env.opts? _env.opts : _env;
            var key = opts.autoescape !== undefined? "autoescape" : "autoesc";


            var ret, before = opts[key];
            opts[key] = !!mode;
            ret = new nunjucks.runtime.SafeString(body());
            opts[key] = before;
            return ret;
        };
    };
};

