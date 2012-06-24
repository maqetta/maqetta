define("dijit/robotx", [
	"dojo/_base/kernel", // kernel.experimental
	"./main",			// original dijit variable in main window
	"dojo/robotx"		// includes doh/robot, dojo/robot, and dojo/robotx, all of which affect and return doh/robot module
], function(kernel, dijit_, robot){

	// module:
	//		dijit/robotx
	// summary:
	//		Loads doh/robot, dojo/robot, dojo/robotx, and
	//		sets dijit global in main window to point to the dijit loaded in the iframe.
	//		TODO: Remove for 2.0.    Tests shouldn't reference a dijit global at all, and should load dojo/robotx
	//		in preference to this file.

	kernel.experimental("dijit.robotx");

	var __updateDocument = robot._updateDocument;

	robot._updateDocument = function(){
		__updateDocument();
		var win = kernel.global;
		if(win.dijit){
			window.dijit = win.dijit; // window reference needed for IE
		}
	};

	return dijit_;
});
