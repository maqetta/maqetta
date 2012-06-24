define([
	"dojo/_base/lang"
], function(lang){

	// module:
	//		dojox/mobile/dh/ContentTypeMap
	// summary:
	//		A component that provides a map for determining content handler
	//		class from a content-type.

	var o = lang.getObject("dojox.mobile.dh.ContentTypeMap", true);

	o.map = {
		"html": "dojox/mobile/dh/HtmlContentHandler",
		"json": "dojox/mobile/dh/JsonContentHandler"
	};

	o.add = function(/*String*/ contentType, /*String*/ handlerClass){
		this.map[contentType] = handlerClass;
	};

	o.getHandlerClass = function(/*String*/ contentType){
		return this.map[contentType];
	};

	return o;
});
