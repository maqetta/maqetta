define([
	"dojo/_base/declare",
	"./Container",
	"./_ContentPaneMixin"
], function(declare, Container, ContentPaneMixin){

	// module:
	//		dojox/mobile/ContentPane
	// summary:
	//		A very simple content pane to embed an HTML fragment.

	return declare("dojox.mobile.ContentPane", [Container, ContentPaneMixin], {
		// summary:
		//		A very simple content pane to embed an HTML fragment.
		// description:
		//		This widget embeds an HTML fragment and run the parser. It has
		//		ability to load external content using dojo/_base/xhr. onLoad()
		//		is called when parsing is done and the content is
		//		ready. Compared with dijit.layout.ContentPane, this widget
		//		provides only basic fuctionality, but it is much smaller than
		//		dijit.layout.ContentPane.

		baseClass: "mblContentPane"
	});
});
