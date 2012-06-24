define([
	"dojo/_base/declare",
	"dijit/_Container",
	"./Pane"
], function(declare, Container, Pane){

	// module:
	//		dojox/mobile/Container
	// summary:
	//		A simple container-type widget.

	return declare("dojox.mobile.Container", [Pane, Container], {
		// summary:
		//		A simple container-type widget.
		// description:
		//		Container is a simple container widget that can be used for any purposes.
		//		It is a widget, but can be regarded as a simple <div> element.

		baseClass: "mblContainer"
	});
});
