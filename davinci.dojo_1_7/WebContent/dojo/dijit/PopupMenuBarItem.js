define([
	"dojo/_base/kernel",
	".",
	"./PopupMenuItem",
	"./MenuBarItem",
	"dojo/_base/declare" // dojo.declare
], function(dojo, dijit){

	// module:
	//		dijit/PopupMenuBarItem
	// summary:
	//		Item in a MenuBar like "File" or "Edit", that spawns a submenu when pressed (or hovered)


	dojo.declare("dijit.PopupMenuBarItem", [dijit.PopupMenuItem, dijit._MenuBarItemMixin], {
		// summary:
		//		Item in a MenuBar like "File" or "Edit", that spawns a submenu when pressed (or hovered)
	});


	return dijit.PopupMenuBarItem;
});
