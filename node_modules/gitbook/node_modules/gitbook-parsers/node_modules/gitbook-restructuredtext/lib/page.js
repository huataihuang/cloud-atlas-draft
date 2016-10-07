var Q = require('q');
var _ = require('lodash');

var convert = require('./utils/convert');

function parsePage(src) {
	return convert(src)
	.then(function(html) {
	    return {
	        sections: [
	            {
	                type: "normal",
	                content: html
	            }
	        ]
	    };
	});
}

module.exports = parsePage;
