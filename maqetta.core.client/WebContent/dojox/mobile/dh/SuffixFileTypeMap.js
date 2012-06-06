define([
	"dojo/_base/lang"
], function(lang){

	// module:
	//		dojox/mobile/dh/SuffixFileTypeMap
	// summary:
	//		A component that provides a map for determining content-type from
	//		the suffix of the URL.

	var o = lang.getObject("dojox.mobile.dh.SuffixFileTypeMap", true);

	o.map = {
		"html": "html",
		"json": "json"
	};

	o.add = function(/*String*/ key, /*String*/ contentType){
		this.map[key] = contentType;
	};

	o.getContentType = function(/*String*/ fileName){
		var fileType = (fileName || "").replace(/.*\./, "");
		return this.map[fileType];
	};

	return o;
});
