define([
	"dojo/_base/kernel", // dojo.deprecated
	"..",
	"../tree/dndSource"
], function(dojo, dijit){
	// module:
	//		dijit/_tree/dndSource
	// summary:
	//		Deprecated module, use dijit.tree.dndSource instead

	// TODO: remove this file in 2.0
	dojo.deprecated("dijit._tree.dndSource has been moved to dijit.tree.dndSource, use that instead", "", "2.0");

	dojo.getObject("_tree", true, dijit);

	dijit._tree.dndSource = dijit.tree.dndSource;


	return dijit._tree.dndSource;
});
