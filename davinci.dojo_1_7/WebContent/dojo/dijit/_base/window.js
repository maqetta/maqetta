define(["dojo", "..", "dojo/window"], function(dojo, dijit){
	// module:
	//		dijit/_base/window
	// summary:
	//		Back compatibility module, new code should use dojo/window directly instead of using this module.

	dijit.getDocumentWindow = function(doc){
		return dojo.window.get(doc);
	};

	return dijit;
});
