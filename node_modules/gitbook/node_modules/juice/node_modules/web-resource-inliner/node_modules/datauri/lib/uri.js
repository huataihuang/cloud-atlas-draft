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

    var tpl = "data:{{ mimetype }};base64,{{ base64 }}";

    return templayed(tpl);

}(require('templayed')));
