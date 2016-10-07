var _ = require("lodash");
var parseEntries = require("./summary").entries;


var parseLangs = function(content) {
   return parseEntries(content);
};

function langsToText(langs) {
	var bl = "\n";
    var content = "Languages"+bl+"============"+bl+bl;

    _.each(langs, function(lang) {
    	content = content + "- `"+lang.title+" <"+lang.path+">`_" + bl;
    });

	return content;
}

module.exports = parseLangs;
module.exports.toText = langsToText;
