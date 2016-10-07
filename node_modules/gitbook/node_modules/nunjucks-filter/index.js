module.exports = function(nunjucks) {
    return function FilterExtension(_env) {
        this.tags = ['filter'];

        this.parse = function(parser, nodes, lexer) {
            // get the tag token
            var tok = parser.nextToken();

            // parse the args and move after the block end. passing true
            // as the second arg is required if there are no parentheses
            var args = parser.parseSignature(null, true);
            parser.advanceAfterBlockEnd(tok.value);

            // parse the body and possibly the error block, which is optional
            var body = parser.parseUntilBlocks('endfilter');

            parser.advanceAfterBlockEnd();

            return new nodes.CallExtension(this, 'run', args, [body]);
        };

        this.run = function(context, filter) {
            var ret, args, body;
            args = Array.prototype.slice.call(arguments);
            body = args[args.length - 1];
            args = args.slice(2,-1);

            ret = new nunjucks.runtime.SafeString(body());
            if (!_env.filters[filter]) throw "Filter '"+filter+"' doesn't exists";

            args.unshift(ret.val);
            ret.val = _env.filters[filter].apply(null, args);
            return ret;
        };
    };
};
