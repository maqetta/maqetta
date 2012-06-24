define([
	"dojo/_base/declare",
	"./IconMenu"
], function(declare, IconMenu){
	// module:
	//		dojox/mobile/GridLayout
	// summary:
	//		A container widget that places its children in a grid layout.

	return declare("dojox.mobile.GridLayout", IconMenu, {
		// cols: Number
		//		The number of child items in a row.
		cols: 0,

		/* internal properties */
		childItemClass: "mblGridItem",
		baseClass: "mblGridLayout",
		_tags: "div",
		_createTerminator: true
	});
});
