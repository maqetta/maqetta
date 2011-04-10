dojo.provide("dijit._base.window");

dojo.require("dojo.window");

dijit.getDocumentWindow = function(doc){
	return dojo.window.get(doc);
};
