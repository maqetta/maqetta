define([
	"dojo/_base/kernel",
	"..",
	"dojo/window" // dojo.window.scrollIntoView
], function(dojo, dijit){
	// module:
	//		dijit/_base/scroll
	// summary:
	//		Back compatibility module, new code should use dojo/window directly instead of using this module.

	dijit.scrollIntoView = function(/*DomNode*/ node, /*Object?*/ pos){
		// summary:
		//		Scroll the passed node into view, if it is not already.
		//		Deprecated, use `dojo.window.scrollIntoView` instead.

		dojo.window.scrollIntoView(node, pos);
	};

	return dijit.scrollIntoView;
});
