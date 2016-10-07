/*
 * datauri - A simple Data URI scheme generator
 * https://github.com/heldr/datauri
 *
 * Copyright (c) 2013 Helder Santana
 * Licensed under the MIT license.
 * https://raw.github.com/heldr/datauri/master/MIT-LICENSE.txt
 */

module.exports = (function (templayed) {
    "use strict";

    var tpl = [
        "",
        ".{{ className }} {",
        "    background: url('{{ background }}')",
        "}"
    ].join('\n');

    return templayed(tpl);

}(require('templayed')));
