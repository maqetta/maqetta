define([
	"dojo/_base/declare",
	"./HtmlContentHandler",
	"../_ExecScriptMixin"
], function(declare, HtmlContentHandler, _ExecScriptMixin){

	// module:
	//		dojox/mobile/dh/HtmlScriptContentHandler
	// summary:
	//		An html content handler that has script execution capability.

	return declare("dojox.mobile.dh.HtmlScriptContentHandler", [HtmlContentHandler, _ExecScriptMixin], {
		// summary:
		//		An html content handler that has script execution capability.
	});
});
